
# Task implementation

## Installation and setup

```sh
$ git clone git@github.com:clocked0ne/datahog.git
$ cd datahog
$ npm install
```

You can either run the application locally or Dockerised, but to run locally you will require your own Redis instance running.

### Local

Providers API
```sh
$ npm run api
```

Webhook application
```sh
$ npm start
```

### Dockerised

```sh
$ docker compose up -d

$ docker compose down
```

Once running, you can call the endpoint with a `POST` to  and the below request body to begin processing a request:
```json
{
  "provider": [
    "gas",
    "internet"
  ],
  "callbackUrl": "http://yourcallbackurl.io/api/"
}
```

## Tests

```sh
$ npm test
```


## Design decisions

To try and stick as close to the brief as possible and meet all the requirements, the webhook has been created through an Express app and associated cron task process, using Redis as an efficient storage engine to hold in-flight request data.

In order to ensure the application is robust, the request data is saved at each stage of processing - including where there are multiple providers in a single request - offering the capability to skip over providers we have already fetched data from instead of repeatedly retrying.

When we have all the data collected to fulfill a request, we attempt to send it to the callback URL provided; if this URL is unavailable/unreachable the request will sit in the processing Redis store until the next processing cycle. 

### AWS Architecture

This event-driven asynchronous approach would benefit from being architected using serverless AWS technologies instead of as a server-based application, not just from a cost perspective but also to benefit from better options for resiliency and scalability.

The cron task would be driven by a Cloudwatch Event that is scheduled to poll at regular intervals, the data could be stored in Elasticache or DynamoDB for predicatable scalability and throughput. The diagram below outlines this flow:

![AWS Cloud](https://github.com/clocked0ne/datahog/blob/master/doc/aws-flow-diagram.png?raw=true)

Within AWS there are other options for how this could be implemented also depending on the business needs, such as using SQS Queues to manage the in-flight requests instead of a data store. 



_The original task is outlined below_

---

# Summary #
At WonderBill we do a lot of data collection and processing from 3rd-party APIs.
We also experience various issues with those APIs - long scheduled maintenance, temporary bad gateway errors due to load etc.
In order to make our data collection tools scalable and fault-tolerant we've devised a webhook-based asynchronous approach. 

## Task at hand ##
We would like you to build a webhook-based API, which accepts a POST payload with the name of the provder to collect the data from ("gas" or "internet"), and a publicly accessible endpoint to call back, once the data for the provider is collected.

## Pre-requisites ##
Before you start you should run:
```
npm install && npm run start
```
This will provide you with a running server, that provides the mock "gas" (`http://localhost:3000/providers/gas`) and "internet" (`http://localhost:3000/providers/internet`) endpoints you will be collecting the data from.

When you attempt to load the endpoints in Postman or even just `curl` them you will see an occasional `500` error - this is intended to simulate outages with our data providers. You will have to work around this and provide a fault-tolerant way of fetching the data as part of completing this task.

## Requirements ##
**_Only use tools and frameworks you are familiar with!_**

**_As our data providers can go offline for extended period of time, the naive implementations of this task using retry mechanisms are not going to be accepted!_**

* Build an API endpoint using Node.js (the likes of Express and Hapi are perfect for this job). You can use TypeScript if you wish;
* The API should accept a POST with two fields `provider` (`gas` or `internet`) and the `callbackUrl`. The payload should be validated accordingly;
* Once payload is accepted, collect the data from the mock endpoint described previously and call the `callbackUrl` with the collected data;
* Use Git whilst working on this task - this will help us understanding how you work;
* Use docker-compose to bootstrap other services you may need to complete the task;
* We expect decent test coverage for the code produced.

## Bonus points ##
* Implemented API endpoint in a self-documented way;
* Consider accepting a payload with multiple providers to collect data from, aggregate from all providers before sending back to the `callbackUrl`;
* Consider `callbackUrl` also being a point of failure.

## Submission ##
Please provide a URL to a github/bitbucket repository for the completed task.

### 🙏🙏THANK YOU FOR YOUR TIME AND EFFORT! 🙏🙏 ###