import axios from "axios";
import { dbConnection } from "../dbconnection.mjs";
import { config } from "../config.mjs";
import qs from "qs";

export async function createPaymentLink(priceToken, localKey) {

    const bodyData = {
        'line_items[0][price]': priceToken,
        'line_items[0][quantity]': 1,
        'after_completion[type]': 'redirect',
        'after_completion[redirect][url]': config.server_host + "/webhooks/stripe/payment-success?id=" + localKey
    };

    let axiosConfig = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + config.stripe_token
        }
    };

    try {
        const stripe_response = await axios.post(config.stripe_api_url + "/v1/payment_links", bodyData, axiosConfig);
        return stripe_response.data;
    } catch (e) {
        console.log(e.message);
        return null;
    }
}

export async function disableLink(link) {
    const bodyData = {
        active: false
    }

    let axiosConfig = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + config.stripe_token
        }
    };

    try {
        const stripe_response = await axios.post(config.stripe_api_url + "/v1/payment_links/" + link, bodyData, axiosConfig);
        return stripe_response.data;
    } catch (e) {
        console.log(e.message);
        return null;
    }
}