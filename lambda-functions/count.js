import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event, context) => {
    console.log("---Raffle---start-handler");
    console.log("---Raffle---event", event);
    let TableName = "raffle";
    try {
        const command = new ScanCommand({
            TableName: TableName,
            Select: "COUNT"
        });
        
        const response = await client.send(command);

        console.log("---Raffle---count", response);
        return response.Count;
    } catch (e) {
        console.log("---Raffle---e", e);
        return e.message;
    }
};

