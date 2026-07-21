import { sendFast2Sms } from "./fast2sms";

export async function sendTestSms(to: string, body: string) {
  return sendFast2Sms({
    to,
    message: body,
  });
}