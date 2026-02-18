const { sendEmailOTP } = require("./src/services/emailService");
require("dotenv").config();

const testTo = process.argv[2] || "rishiparsad4@gmail.com";

async function runTest() {
    console.log(`Starting email test to: ${testTo}`);
    const result = await sendEmailOTP(testTo, "123456");
    if (result) {
        console.log("TEST PASSED: Email sent successfully.");
    } else {
        console.log("TEST FAILED: Email could not be sent. Check logs above.");
    }
    process.exit();
}

runTest();
