# 🏆 Raffle Application

This project describes how to set up a complete AWS-based raffle application using **DynamoDB**, **Lambda**, **API Gateway**, **mTLS**, and **S3 + CloudFront** hosting.

---

## 🎥 Demo

▶️ **Watch the demo here:**
[![Raffle Application Demo](https://img.youtube.com/vi/bOuHGb9JLfI/0.jpg)](https://youtu.be/bOuHGb9JLfI)

---

## 1. Create the DynamoDB Table

**Table name:** `raffle`
**Partition key:** `email`
**Table class:** `Standard-IA` (Infrequent Access)

### Attributes

Each participant record contains:

| Attribute | Type   | Description                                             |
| --------- | ------ | ------------------------------------------------------- |
| `email`   | String | The participant’s email address (**unique identifier**) |
| `name`    | String | The participant’s full name                             |
| `phone`   | String | The participant’s phone number                          |
| `won`     | String | Indicates if the participant has won                    |

---

## 2. Create the Lambda Functions

### IAM Role

Create an IAM role that allows Lambda functions to access **DynamoDB** and **CloudWatch Logs** with the following managed policies:

* `AmazonDynamoDBFullAccess_v2`
* `AWSLambdaDynamoDBExecutionRole`
* `AWSLambdaInvocation-DynamoDB`
* `CloudWatchLogsFullAccess`

### Functions

Use **Node.js 22.x** runtime.
After creation, **reduce the timeout to 1 second** except with draw having a 3 seconds timeout.

| Function    | Description                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------- |
| **`apply`** | Accepts participant details and adds a new item to the `raffle` table                         |
| **`count`** | Retrieves the total number of participants in the table                                       |
| **`draw`**  | Randomly selects **three** participants and updates their `won` field to mark them as winners |

For each function, create appropriate **test cases** to validate behavior and edge cases.

---

## 3. Create the API Gateway

### Domain Setup

(Optional) Create a custom domain, e.g. `faresahmed.link`.

1. Generate an HTTPS certificate using **AWS Certificate Manager (ACM)** for `api.faresahmed.link`.
2. Validate it using **DNS**.

### API Configuration

Create an **HTTP API** named `raffle`, add the Lambda functions as integrations, and configure routes as follows:

| Method | Path     | Integration    |
| ------ | -------- | -------------- |
| `POST` | `/apply` | `raffle_apply` |
| `GET`  | `/count` | `raffle_count` |
| `GET`  | `/draw`  | `raffle_draw`  |

Enable **Auto-Deploy** on the default stage.

### Custom Domain Mapping

1. Add custom domain `api.faresahmed.link` and attach the previously created certificate.
2. In **Route53**, create a new record for `api.faresahmed.link` as an **Alias** to the API Gateway domain.
3. Back in API Gateway, create an **API Mapping** to map the domain to the `raffle` API, optionally under the path `/raffle`.

**Test your API:**

```bash
curl https://api.faresahmed.link/raffle/count
```

Expected output: the number of participants in the DynamoDB table.

---

## 4. Enable Mutual TLS (mTLS) Authentication

Follow [AWS’s mTLS setup guide](https://aws.amazon.com/blogs/compute/introducing-mutual-tls-authentication-for-amazon-api-gateway/).

### Steps

1. Create a **Root CA** certificate and client certificates.
2. Upload `RootCA.pem` to an **S3 bucket**.
3. In **API Gateway**, enable **mTLS** on your custom domain by providing the S3 URI for `RootCA.pem`.
4. Disable the default API endpoint (`API: raffle`) as prompted.
5. Wait for the update to complete.

After enabling mTLS, browsers or clients without the client certificate will be rejected.

**Test using `curl`:**

```bash
curl --key my_client.key --cert my_client.pem https://api.faresahmed.link/raffle/count
```

> Add the client certificate to your browser to test secure access.
> **Reference:** [aboutssl.org/ssl-guide](https://aboutssl.org/ssl-guide/)

---

## 5. Frontend Hosting (S3 + CloudFront)

Follow the [S3 Static Website Hosting Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html).

### Steps

1. Create an S3 bucket for your frontend.
2. Enable **Static Website Hosting**, with the **index document** set to `apply.html`.
3. Allow **public access** and add a **bucket policy** to permit read access to all files.
4. Create a **CloudFront distribution**:

   * **Origin:** the S3 bucket.
   * **Domain name:** `faresahmed.link`
   * **Certificate:** use one created in **us-east-1** for TLS.

After deployment, create a **DNS record** in Route53 pointing your domain name to the CloudFront distribution.

### CORS Configuration

To allow your frontend domain to call the API, add the following origins to your API Gateway’s **CORS** settings:

```text
https://faresahmed.link
https://www.faresahmed.link
```

Set them under `Access-Control-Allow-Origin`.
