/**
 * useExchangeRate.js
 * 
 * custom React hook for fetching currency exchange rates and converting prices to USD
 * 
 * **/

import { useState, useEffect } from 'react';

export function useExchangeRate() {
    const [rates, setRates] = useState(null);

    useEffect(() => {
        // Fetch real exchange rate from exchangerate-api (USD base)
        fetch('https://open.er-api.com/v6/latest/USD')
            .then(res => res.json())
            .then(data => {
                if (data && data.rates) {
                    setRates(data.rates);
                }
            })
            .catch(err => console.error("Could not fetch exchange rates", err));
    }, []);

    // Convert from a given currency to USD
    // 'val' is the price in the native currency
    // 'currency' is the native currency code (e.g. NOK, EUR)
    const convertToUSD = (val, currency) => {
        if (!rates) return val;

        let currencyUpper = "USD";
        if (currency && typeof currency === "string") {
            currencyUpper = currency.toUpperCase();
        }

        if (currencyUpper === 'USD') return val;

        const rate = rates[currencyUpper];
        if (!rate) return val; // fallback if currency not found

        // Exchangerate-api gives rates relative to 1 USD.
        // e.g. 1 USD = 10.9 NOK.
        // To get USD from NOK, divide by the rate: val / 10.9
        return val / rate;
    };

    return { rates, convertToUSD };
}
