import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    console.log("---Raffle---start-handler");
    console.log("---Raffle---event", event);

    let TableName = "raffle";
    let body;

    try {
        if (event.body) {
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = event.body;
            }
        } else {
            body = event;
        }
        console.log("---Raffle---body", body);

        if (!body.name) {
            return "where is your name!";
        } else if (!body.phone) {
            return "where is your phone!";
        } else if (!body.email) {
            return "where is your email!";
        }


        const command = new PutCommand({
            TableName: TableName,
            Item: {
                email: body.email,
                phone: body.phone,
                name: body.name,
                won: "no"
            },
        });

        const dynamo_response = await docClient.send(command);
        console.log("---Raffle---dynamo-response", dynamo_response);
        return "Thanks, Your data may have been received;)";

    } catch (e) {
        console.log("---Raffle---e", e);
        return e.message;
    }
};