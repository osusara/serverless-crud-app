'use strict';
const AWS = require('aws-sdk');

module.exports = {
  create: async (event, context) => {
    let body = {};

    try {
      body = JSON.parse(event.body);
    } catch (error) {
      console.log(error);
      return { statusCode: 400 };
    }

    if(typeof body.name === 'undefined' || typeof body.age === 'undefined') {
      console.log("Missing parameters");
      return { statusCode: 400 };
    }

    let putParams = {
      TableName: process.env.DYNAMODB_USER_TABLE,
      Item: {
        name: body.name,
        age: body.age
      }
    };

    let putResult = {};

    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      putResult = await dynamodb.put(putParams).promise();

    } catch (error) {
      console.log(error);
      return { statusCode: 500 };
    }

    return { statusCode: 200 };
  },
  list: async (event, context) => {
    let scanParams = { TableName: process.env.DYNAMODB_USER_TABLE };

    let scanResult = {};
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      scanResult = await dynamodb.scan(scanParams).promise()

    } catch (error) {
      console.log(error);
      return { statusCode: 500 };
    }

    if(scanResult.Items === null || !Array.isArray(scanResult.Items) || scanResult.Items.length === 0) {
      return { statusCode: 404 };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(scanResult.Items.map(user => {
        return {
          name: user.name,
          age: user.age
        }
      }))
    };
  },
  get: async (event, context) => {
    let getParams = {
      TableName: process.env.DYNAMODB_USER_TABLE,
      key: { name: event.pathParameters.name }
    };

    let getResult = {}
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      getResult = dynamodb.get(getParams).promise();

    } catch (error) {
      console.log(error);
      return { statusCode: 500 };
    }

    if(getResult.Item === null)
      return { statusCode: 404 };

    return {
      statusCode: 200,
      body: JSON.stringify({
        name: getResult.Item.name,
        age: getResult.Item.age
      })
    };
  },
  update: async (event, context) => {
    let body = {};

    try {
      body = JSON.parse(event.body);
    } catch (error) {
      console.log(error);
      return { statusCode: 400 };
    }

    if (typeof body.age === "undefined") {
      console.log("Missing parameters");
      return { statusCode: 400 };
    }

    let updateParams = {
      TableName: process.env.DYNAMODB_USER_TABLE,
      key: { name: event.pathParameters.name },
      updateExpression: 'set #age = :age',
      ExpressionAttributeName: { '#age': 'age' },
      ExpressionAttributeValues: { ':age': body.age }
    };

    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      dynamodb.update(updateParams).promise();

    } catch (error) {
      console.log(error);
      return { statusCode: 500 };
    }

    return { statusCode: 200 };
  },
  delete: async (event, context) => {
    let deleteParams = {
      TableName: process.env.DYNAMODB_USER_TABLE,
      key: { name: event.pathParameters.name },
    };

    let deleteResult = {};
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient();
      deleteResult = dynamodb.delete(deleteParams).promise();

    } catch (error) {
      console.log(error);
      return { statusCode: 500 };
    }

    return { statusCode: 200 };
  }
};
