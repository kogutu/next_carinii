
import crypto from 'crypto';
import logger from '../logger';
import _ from 'lodash';



export interface P24TransactionResponse {
    token: string;
    redirectUrl: string;
    error?: string;
    errorCode?: number;
    // ... inne potencjalne pola
}
// ─── Configuration ───────────────────────────────────────────────
var prod_P24_CONFIG = {
    merchantId: parseInt('125840'),
    posId: parseInt('125840'),
    crcKey: 'be058f2b5a885ed6',
    apiKey: process.env.P24_API_KEY || 'f0d3213a2591b9fd232fd93fbc8a874a',
    sandbox: process.env.P24_SANDBOX === 'false',
    merchantName: "Sklep Hert.pl"
};
var sand_P24_CONFIG = {
    merchantId: parseInt('125840'),
    posId: parseInt('125840'),
    crcKey: 'b52ee869fd901983',
    apiKey: 'a7046dac8c999747bffe8e9b09c9da43',
    sandbox: true,
    merchantName: "Sklep Hert.pl -SANDBOX-"

};

var attempts: number = 0;

const P24_CONFIG = sand_P24_CONFIG;


const BASE_URL = P24_CONFIG.sandbox
    ? 'https://sandbox.przelewy24.pl'
    : 'https://secure.przelewy24.pl';

const API_URL = `${BASE_URL}/api/v1`;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
var urlReturn = `${appUrl}/success/oid?sessionId=`
var urlStatus = `${appUrl}/api/p24/verify`
urlStatus = `https://hert.pl/devback/Nextjs-api/payment/statusp24/index.php`
var oid = "";

// ─── SHA-384 Sign Calculation ────────────────────────────────────
// Per P24 docs: sign = sha384(json_encode({sessionId, merchantId, amount, currency, crc}))
export function calculateSign(params: Record<string, string | number>): string {
    const dataString = JSON.stringify(params);
    return crypto.createHash('sha384').update(dataString).digest('hex');
}

// ─── Auth Header (Basic Auth: posId:apiKey) ──────────────────────
function getAuthHeader(): string {
    const credentials = `${P24_CONFIG.posId}:${P24_CONFIG.apiKey}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

// ─── Generic API Request ─────────────────────────────────────────
async function p24Request(endpoint: string, body: Record<string, unknown>) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: getAuthHeader(),
        },
        body: JSON.stringify(body),
    });
    console.log("---------getAuthHeader------------");
    console.log(`${API_URL}${endpoint}`);
    console.log(getAuthHeader())
    console.log(JSON.stringify(body));
    // console.log(await response.text());
    console.log("-----------getAuthHeader----------");


    const data = await response.json();

    if (!response.ok) {


        throw new Error(data.code || data.erorr);
    }

    return data;
}

// ─── Generic API Request ─────────────────────────────────────────
async function p24RequestPUT(endpoint: string, body: Record<string, unknown>) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: getAuthHeader(),
        },
        body: JSON.stringify(body),
    });
    console.log("---------getAuthHeader------------");
    console.log(`${API_URL}${endpoint}`);
    console.log(getAuthHeader())
    console.log(JSON.stringify(body));
    // console.log(await response.text());
    console.log("-----------getAuthHeader----------");


    const data = await response.json();

    return data;
}

// ─── Register Transaction ────────────────────────────────────────
// Returns a token used for redirect or BLIK chargeByCode
export interface RegisterTransactionParams {
    sessionId: string;
    amount: number; // in grosze (1 PLN = 100)
    currency?: string;
    description: string;
    email: string;
    methodRefId?: string;
    oid?: any,
    client?: string;
    country?: string;
    language?: string;
    method?: number; // 154 = BLIK, 266 = Google Pay
    channel?: number;
    timeLimit?: number;
}

var orderId = "1";
export function setUrlsP24(id: string) {
    oid = id;


    urlReturn = `${appUrl}/success/oid/${oid}?sessionId=`
    urlStatus = `${appUrl}/api/p24/verify?oid=${oid}`


}





export async function registerTransaction(params: RegisterTransactionParams) {
    const {
        sessionId,
        amount,
        currency = 'PLN',
        description,
        email,
        oid,
        client,
        country = 'PL',
        language = 'pl',
        method,
        channel,
        methodRefId,
        timeLimit = 15,
    } = params;





    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    urlReturn = `${appUrl}/success/oid/${oid}?sessionId=${sessionId}`





    // Calculate sign per P24 documentation
    const signData = {
        sessionId,
        merchantId: P24_CONFIG.merchantId,
        amount,
        currency,
        crc: P24_CONFIG.crcKey,
    };
    const sign = calculateSign(signData);

    const body: Record<string, unknown> = {
        merchantId: P24_CONFIG.merchantId,
        posId: P24_CONFIG.posId,
        sessionId,
        amount,
        currency,
        description,
        email,
        country,
        language,
        urlReturn,
        urlStatus,
        timeLimit,
        encoding: 'UTF-8',
        sign,
    };

    if (client) body.client = client;
    if (method) body.method = method;
    if (channel) body.channel = channel;
    if (methodRefId) body.methodRefId = methodRefId;

    console.log(body);

    const result = await p24Request('/transaction/register', body);

    await fetch(`${appUrl}/api/payments/session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oid: oid, sessionId: sessionId, amount: amount })
    })
    console.log(result);
    return {
        token: result.data.token,
        redirectUrl: `${BASE_URL}/trnRequest/${result.data.token}`,
    };
}



// ─── BLIK Charge By Code (Level 0) ──────────────────────────────
// After registering transaction, charge using the 6-digit BLIK code
export async function blikChargeByCode(token: string, blikCode: string) {
    const result = await p24Request('/paymentMethod/blik/chargeByCode', {
        token,
        blikCode,
    });



    return result;
}

// ─── Verify Transaction ──────────────────────────────────────────
// Called when P24 sends notification to urlStatus
export async function verifyTransaction(params: {
    sessionId: string;
    orderId: number;
    amount: number;
    currency?: string;
}) {
    const { sessionId, orderId, amount, currency = 'PLN' } = params;

    const signData = {
        sessionId,
        orderId,
        amount,
        currency,
        crc: P24_CONFIG.crcKey,
    };
    const sign = calculateSign(signData);

    const result: any = await p24RequestPUT('/transaction/verify', {
        merchantId: P24_CONFIG.merchantId,
        posId: P24_CONFIG.posId,
        sessionId,
        amount,
        currency,
        orderId,
        sign,
    });

    console.log(result, {
        merchantId: P24_CONFIG.merchantId,
        posId: P24_CONFIG.posId,
        sessionId,
        amount,
        currency,
        orderId,
        sign,
    });
    console.clear();
    let status = "processing";
    console.log("---2-orderId-2-");


    console.log(oid);
    console.log("---2--2-");

    if (_.has(result, "error")) {
        status = "processing";
    } else {
        console.log(result);
        status = result.data.status;
    }
    let r: any = {
        attempts: attempts++,
        status: status

    };

    const { updateStatusPayload } = await import('./payment_calbacks');
    updateStatusPayload(oid, status == "success" ? 'paid' : 'unpaid', JSON.stringify(result));


    return r;
}

// ─── Test Access ─────────────────────────────────────────────────
export async function testAccess() {
    const response = await fetch(`${API_URL}/testAccess`, {
        method: 'GET',
        headers: {
            Authorization: getAuthHeader(),
        },
    });
    return response.json();
}

export { P24_CONFIG, BASE_URL };