"use latest";
import requestPromise from 'request-promise@1.0.2'
import numeral from 'numeraljs@1.5.3'
import Bluebird from 'bluebird@3.5.0'

const slackCrypto = (context, callback) => {
    let cryptoOptions = {
        uri: 'https://min-api.cryptocompare.com/data/pricemulti',
        qs: {
            fsyms: 'BTC,ETH,BCH',
            tsyms: 'USD'
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    let dolarTodayOptions = {
        uri: 'https://s3.amazonaws.com/dolartoday/data.json',
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    }

    let cryptos = requestPromise(cryptoOptions)
    let dolartoday = requestPromise(dolarTodayOptions)

    Bluebird.all([cryptos, dolartoday])
        .spread((cryptoData, dolarTodayData) => {
            let slackMsg = {
                color: "good",
                title: "Informacion del mercado",
                fields: [
                    {
                        title: "bitcoin",
                        value: numeral(cryptoData.BTC.USD).format('$0,0.00'),
                        short: false
                    },
                    {
                        title: "Ethereum",
                        value: numeral(cryptoData.ETH.USD).format('$0,0.00'),
                        short: false
                    },
                    {
                        title: "Bitcoin Cash",
                        value: numeral(cryptoData.BCH.USD).format('$0,0.00'),
                        short: false
                    },
                    {
                        title: "DolarToday USD",
                        value: "Bs."+numeral(dolarTodayData.USD.dolartoday).format('0,0.00'),
                        short: false
                    }
                    ,
                    {
                        title: "DolarToday EURO",
                        value: "Bs."+numeral(dolarTodayData.EUR.dolartoday).format('0,0.00'),
                        short: false
                    },
                    {
                        title: "Para mas informacion visita",
                        value: "http://www.mykurrencies.xyz",
                        short: false
                    }
                ]
            };

            let slackOptions = {
                method: 'POST',
                uri: 'https://hooks.slack.com/services/' + context.secrets.slack_channel_access,
                body: {
                    attachments: [slackMsg]
                },
                json: true
            };
            requestPromise(slackOptions)
                .catch(function (err) {
                    callback(null, 'Error sending message to slack: ' + err)
                })
        })
        .catch(err => {
            callback(null, 'An error has occured with the requests: ' + err)
        })

}

export default slackCrypto;