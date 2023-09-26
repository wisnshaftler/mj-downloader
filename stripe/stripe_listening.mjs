import express from "express";
import { dbConnection } from "../dbconnection.mjs";
import { disableLink } from "./stripe_link.mjs";
import { addRequestCount } from "../utils/server_package_manage.mjs";

const stripeRouter = express.Router();

stripeRouter.get("/payment-success", async (req, res)=>{
    const local_key = req.query.id;
    if(local_key == null || local_key == undefined ){
        return res.send(404);
    }

    //get payment data from the payments table
    const payments = await dbConnection("select packages.package_max_req as package_req, payments.payment_link as payment_link, payments.guild_id as guild_id, payments.link_data as link_data from packages, payments  where payments.local_key = ? and payments.package_name = packages.package_name and  "+
    " payments.is_used = 0 ", [local_key]);
    if(payments.rows.length !==1 ) {
        return res.status(400).send("There are no payments");
    }

    const packageRequests = parseInt(payments.rows[0].package_req);
    const paymentLink = payments.rows[0].payment_link;
    const guildId = payments.rows[0].guild_id;
    const linkData = JSON.parse(payments.rows[0].link_data);
    
    //mark as expired link and send
    dbConnection("update payments set link_expire_date = ?, is_used = ? , paid_date = ? where local_key = ?" , [new Date(), 1, new Date(), local_key ]);

    //update guild request count
    addRequestCount(guildId, packageRequests);
    
    //send stripe to disable the payment link
    disableLink(linkData.id);

    // res.send("done");
    res.redirect("https://discord.com/channels/@me");
})


export { stripeRouter}