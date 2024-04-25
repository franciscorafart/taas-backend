// aws-config.js
import * as aws from "@aws-sdk/client-ses";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import * as nodemailer from "nodemailer";

const ses = new aws.SES([
  {
    apiVersion: "2010-12-01",
    region: "us-east-1",
    defaultProvider,
  },
]);

const transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

export default transporter;
