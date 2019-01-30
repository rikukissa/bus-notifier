import axios from "axios";
import { IResponse } from "./response";
import { differenceInMinutes, differenceInSeconds } from "date-fns";
import { IncomingMessage, ServerResponse } from "http";
import { IUpdate } from "./telegram-message";

const botToken = process.env.BOT_TOKEN;

function readBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise(resolve => {
    let body = "";
    req.on("readable", () => {
      body += req.read();
    });
    req.on("end", () => {
      resolve(JSON.parse(body));
    });
  });
}

function sendMessageToTelegram(text: string, chatId: number) {
  return axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    chat_id: chatId,
    text
  });
}

async function findBusses(stopNumber: string, lineRefs: string[]) {
  const { data } = await axios.get<IResponse>(
    `http://data.itsfactory.fi/journeys/api/1/stop-monitoring?stops=${stopNumber}`
  );

  return data.body[stopNumber].filter(
    bus => lineRefs.indexOf(bus.lineRef) > -1
  );
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main(
  stopNumber: string,
  lineRefs: string[],
  alertWhen: number,
  chatId: number
): Promise<void> {
  const buses = await findBusses(stopNumber, lineRefs);

  if (buses.length === 0) {
    sendMessageToTelegram("Cannot find buses with that criteria", chatId);
    return;
  }

  const busesAlmostThere = buses.filter(
    bus =>
      differenceInMinutes(bus.call.expectedArrivalTime, new Date()) <= alertWhen
  );

  busesAlmostThere.forEach(bus => {
    const arrivesIn = differenceInSeconds(
      bus.call.expectedArrivalTime,
      new Date()
    );

    sendMessageToTelegram(
      `${bus.lineRef} arriving in approximately ${Math.floor(
        arrivesIn / 60
      )} minutes and ${arrivesIn % 60} seconds`,
      chatId
    );
  });

  if (busesAlmostThere.length === 0) {
    await sleep(10000);
    main(stopNumber, lineRefs, alertWhen, chatId);
  }
}

module.exports = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await readBody<IUpdate>(req);
  if (!body.message || !body.message.text) {
    res.writeHead(400);
    res.end();
    return;
  }

  const [stop, lineRefs, alertWhen] = body.message.text.split(" ");

  main(
    stop,
    lineRefs.split(","),
    parseInt(alertWhen, 10),
    body.message.chat.id
  ).catch(err => console.error(err));

  res.writeHead(200);
  res.end();
};
