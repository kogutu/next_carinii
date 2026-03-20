'use server'
import { executeSQL } from "../db-mysql";

export async function initPayment(incrementId: string, paymentMethod: string) {
    await executeSQL(
        "INSERT INTO payment_callbacks (oid, provider, status, updated_at) VALUES (?, ?, ?, ?)",
        [incrementId, paymentMethod, "init", new Date()]
    );
}

export async function updateStatusPayload(
    oid: string,
    status: string,
    payload?: any
) {
    if (status && !payload) {
        await executeSQL(
            "UPDATE payment_callbacks SET status = ?, updated_at = ? WHERE oid = ?",
            [status, new Date(), oid]
        );
        return;
    }

    await executeSQL(
        "UPDATE payment_callbacks SET payload = ?, status = ?, updated_at = ? WHERE oid = ?",
        [JSON.stringify(payload), status, new Date(), oid]
    );
}


export async function setLogPayment(incrementId: string, log: any) {
    await executeSQL(
        "INSERT INTO payment_changelog (oid, log) VALUES (?, ?)",
        [incrementId, JSON.stringify(log)]
    );
    return true;
}



export async function setSessionIdPayment(oid: string, sessionId: string, amount: string, orderId: string = "") {
    console.log([sessionId, new Date(), oid])
    if (orderId) {
        await executeSQL(
            "UPDATE payment_callbacks SET sessionId = ?, orderId = ?, amount = ?, updated_at = ? WHERE oid = ?",
            [sessionId, orderId, amount, new Date(), oid]
        );
    } else {
        await executeSQL(
            "UPDATE payment_callbacks SET sessionId = ?,   amount = ?, updated_at = ? WHERE oid = ?",
            [sessionId, amount, new Date(), oid]
        );
    }
    return true;
}
