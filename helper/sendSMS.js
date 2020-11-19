const { smsAccount } = require('./../config/credentials');
const accountSid = smsAccount.accountSid;
const authToken = smsAccount.authToken;
const client = require('twilio')(accountSid, authToken);

exports.sendSMS = async (body, to) => {
  const message = {
    body: body,
    from: '+12029308569',
    to: to,
  };

  await client.messages.create(message);
};
