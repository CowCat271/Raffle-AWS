import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamo = new DynamoDBClient({});
const client = DynamoDBDocumentClient.from(dynamo);

export const handler = async (event) => {
  console.log("---Raffle---start-handler");
  console.log("---Raffle---event", event);
  let TableName = "raffle";
  let winners_count = 3;
  try {
    console.log("---Raffle---try");

    const command = new ScanCommand({
      FilterExpression: "won = :w",
      ExpressionAttributeValues: {
        ":w": "no"
      },
      TableName: TableName
    });

    const data = await client.send(command);

    console.log("---Raffle---items-count", data.Items.length);

    if (data.Items.length < winners_count) {
      const log_no_data = "There is no enough data! " + data.Items.length + " only";
      console.log("---Raffle---error", log_no_data);
      return log_no_data;
    }

    let indics = [];
    let winners = [];
    for (let i = 0; i < winners_count; i++) {
      let newIndex = Math.floor(Math.random() * data.Items.length);
      if (indics.includes(newIndex)) {
        i--;
        continue;
      }
      indics[i] = newIndex;
      winners.push(data.Items[newIndex]);
    }

    for (let i = 0; i < winners.length; i++) {

      const update_command = new UpdateCommand({
        TableName: TableName,
        Key: {
          email: winners[i].email
        },
        UpdateExpression: 'set won = :r',
        ExpressionAttributeValues: {
          ':r': 'yes',
        }
      });
      const response = await client.send(update_command);
      console.log(response);
    }

    return {
      "winners": winners
    };

  } catch (err) {
    console.log(err);
    return err.message;
  }
};
