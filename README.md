# Raffle or Drawing Application 🎁

## Project Overview

This project implements a simple raffle or drawing application using Amazon Web Services (AWS). It uses a serverless architecture with **Amazon DynamoDB** for data storage, **AWS Lambda** for backend logic, and **Amazon API Gateway** to expose the application's functionality. The frontend, consisting of HTML pages, is hosted on **Amazon S3** and served through **Amazon CloudFront**. For enhanced security, the API uses **mutual TLS (mTLS) authentication**.

<br>

---

<br>

## Setup and Deployment

### 1. DynamoDB Table

First, create a DynamoDB table to store the raffle participants' data. The table will serve as the persistent data store for the application.

* **Table Name**: `devops90_raffle`
* **Partition Key**: `email` (String)

The table will hold objects with the following attributes for each participant:

* `email`: The participant's email address (String). This is also the unique identifier.
* `name`: The participant's full name (String).
* `phone`: The participant's phone number (String).
* `won`: A status field to indicate if the participant has won (String).

<br>

---

<br>

### 2. AWS Lambda Functions

Three separate Lambda functions are required to handle the core logic of the application. These functions will perform operations on the DynamoDB table.

* **`apply`**: A function that accepts participant details and adds them as a new item to the `devops90_raffle` table.
* **`count`**: A function that retrieves the total number of items (participants) currently in the `devops90_raffle` table.
* **`draw`**: A function that randomly selects **three** participants from the table and updates their `won` attribute to mark them as winners.

**Note**: A dedicated **IAM Role** must be created and attached to these Lambda functions. This role needs the necessary permissions to perform `PutItem`, `GetItem`, and `UpdateItem` actions on the `devops90_raffle` DynamoDB table.

<br>

---

<br>

### 3. API Gateway

API Gateway is used to create a REST API that exposes the Lambda functions to the internet. This allows the frontend to interact with the backend logic.

* **Domain Name**: An optional, but recommended, step is to use a custom domain name (e.g., `farisahmed.link`).
* **ACM Certificate**: If using a custom domain, a certificate must be requested from **AWS Certificate Manager (ACM)** for the domain.
* **Custom Domain**: Add the custom domain name to the API Gateway and associate it with the certificate.
* **DNS Record**: Create a **DNS A record** that points the custom domain to the API Gateway's endpoint. This is typically done by setting an **Alias** record in Amazon Route 53.
* **API Mapping**: Configure the API mapping in API Gateway to link a specific path (e.g., `/raffle`) to the deployed API stage.
* **Integrations**: Connect the API Gateway endpoints to their respective Lambda functions (`apply`, `count`, and `draw`).

<br>

---

<br>

### 4. Mutual TLS (mTLS) Authentication

To secure the API, enable mTLS on the API Gateway. This requires clients to present a valid client certificate issued by a trusted Certificate Authority (CA) that you specify. This step ensures that only authorized clients can access the API.

<br>

---

<br>

### 5. Frontend Hosting

The frontend static web pages are hosted on Amazon S3 and served securely and efficiently via CloudFront.

* **S3 Bucket**: Create an S3 bucket and upload the HTML, CSS, and JavaScript files for the application's user interface.
* **CloudFront Distribution**: Create a **CloudFront distribution** with the S3 bucket as its origin. This will cache the content at edge locations, reducing latency for users worldwide.
* **DNS**: Configure the DNS for the frontend's domain to point to the CloudFront distribution.
