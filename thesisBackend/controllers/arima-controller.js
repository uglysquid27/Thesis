const { log } = require('console');
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal } = require('sequelize');

const adfTestForStationarity = (data) => {
    // Calculate the difference between consecutive elements
    const diffData = data.map((value, index) => index > 0 ? value - data[index - 1] : 0);

    // Calculate the mean and standard deviation of the differences
    const meanDiff = diffData.reduce((acc, val) => acc + val, 0) / diffData.length;
    const stdDevDiff = Math.sqrt(diffData.reduce((acc, val) => acc + Math.pow(val - meanDiff, 2), 0) / (diffData.length - 1));

    // Calculate the test statistic (ADF statistic)
    const adfStatistic = Math.abs(meanDiff / stdDevDiff);

    // Set the critical value for the ADF test (depends on the significance level)
    // For example, for a significance level of 0.05 and a sample size of 100, the critical value is approximately -2.89
    const criticalValue = -2.89;

    // Determine if the series is stationary based on the ADF statistic and critical value
    const isStationary = adfStatistic < criticalValue;

    return { adfStatistic, isStationary };
};

// Function to calculate ACF (Autocorrelation Function)
const acf = (data, lag) => {
    // Calculate the mean of the data
    const meanVal = data.reduce((acc, val) => acc + val, 0) / data.length;

    // Calculate the autocovariance at lag k
    const autoCovariance = (data, meanVal, k) => {
        let cov = 0;
        for (let t = k; t < data.length; t++) {
            cov += (data[t] - meanVal) * (data[t - k] - meanVal);
        }
        return cov / (data.length - k);
    };

    // Calculate the autocorrelation at lag k
    const acfValues = [];
    for (let l = 0; l <= lag; l++) {
        acfValues.push(autoCovariance(data, meanVal, l) / autoCovariance(data, meanVal, 0));
    }

    return acfValues;
};

// Function to calculate PACF (Partial Autocorrelation Function)
const pacf = (data, lag) => {
    // Function to calculate the partial autocorrelation at lag k
    const partialCorrelation = (acfValues, k) => {
        const numerator = acfValues[k];
        const denominator = Math.sqrt(acfValues[0]);
        return numerator / denominator;
    };

    // Calculate ACF values up to lag
    const acfValues = acf(data, lag);

    // Calculate PACF values
    const pacfValues = [1]; // First PACF value is always 1
    for (let l = 1; l <= lag; l++) {
        const partialAcf = acf(data.slice(0, l + 1), l);
        pacfValues.push(partialCorrelation(partialAcf, l));
    }

    return pacfValues;
};

// Function to identify ARIMA model parameters
const differenceDataTwice = (data) => {
    const diffDataTwice = [];
    for (let i = 2; i < data.length; i++) {
        diffDataTwice.push(data[i] - 2 * data[i - 1] + data[i - 2]);
    }
    return diffDataTwice;
};

// Function to identify ARIMA model parameters
const identifyArimaParams = (data, maxLag) => {
    // Perform second-order differencing on the data
    const diffDataTwice = differenceDataTwice(data);

    // Perform ADF test on doubly differenced data to check for stationarity
    const { isStationary } = adfTestForStationarity(diffDataTwice);

    if (!isStationary) {
        console.log('The doubly differenced data is not stationary. Consider other transformations.');
        return { p: null, d: null, q: null };
    }

    // Calculate ACF and PACF values for the doubly differenced data
    const acfValues = acf(diffDataTwice, maxLag);
    const pacfValues = pacf(diffDataTwice, maxLag);

    console.log('ACF (Doubly Differenced Data):', acfValues);
    console.log('PACF (Doubly Differenced Data):', pacfValues);

    // Identify ARIMA parameters based on ACF and PACF plots or rules
    // For simplicity, we can manually analyze the plots or apply rules to determine the parameters

    const p = 1; // AR order
    const d = 2; // Differencing order (second-order differencing)
    const q = 1; // MA order

    return { p, d, q };
};
module.exports = {
    index: async (req, res) => {
        try {
            const pr = await LabelTab.findAll({
                attributes: [
                    [literal('DISTINCT DATE(time)'), 'date'],
                    'Label_Length_AVE'
                ],
                where: {
                    [Op.or]: [
                        { Label_Length_AVE: { [Op.ne]: 0 } }
                    ]
                },
                group: [literal('DATE(time)')],
                order: [[literal('DATE(time)'), 'ASC']],
                limit: 100
            });
    
            // Convert fetched data to an array of values
            const data = pr.map(item => item.Label_Length_AVE);
    
            console.log('Array result:', data);
    
            // Function to calculate ACF (Autocorrelation Function)
            const acf = (data, lag) => {
                // Calculate the mean of the data
                const meanVal = data.reduce((acc, val) => acc + val, 0) / data.length;
    
                // Calculate the autocovariance at lag k
                const autoCovariance = (data, meanVal, k) => {
                    let cov = 0;
                    for (let t = k; t < data.length; t++) {
                        cov += (data[t] - meanVal) * (data[t - k] - meanVal);
                    }
                    return cov / (data.length - k);
                };
    
                // Calculate the autocorrelation at lag k
                const acfValues = [];
                for (let l = 0; l <= lag; l++) {
                    acfValues.push(autoCovariance(data, meanVal, l) / autoCovariance(data, meanVal, 0));
                }
    
                return acfValues;
            };
    
            // Function to calculate PACF (Partial Autocorrelation Function)
            const pacf = (data, lag) => {
                // Function to calculate the partial autocorrelation at lag k
                const partialCorrelation = (acfValues, k) => {
                    const numerator = acfValues[k];
                    const denominator = Math.sqrt(acfValues[0]);
                    return numerator / denominator;
                };
    
                // Calculate ACF values up to lag
                const acfValues = acf(data, lag);
    
                // Calculate PACF values
                const pacfValues = [1]; // First PACF value is always 1
                for (let l = 1; l <= lag; l++) {
                    const partialAcf = acf(data.slice(0, l + 1), l);
                    pacfValues.push(partialCorrelation(partialAcf, l));
                }
    
                return pacfValues;
            };
    
            // Function to identify ARIMA model parameters
            const differenceDataTwice = (data) => {
                const diffDataTwice = [];
                for (let i = 2; i < data.length; i++) {
                    diffDataTwice.push(data[i] - 2 * data[i - 1] + data[i - 2]);
                }
                return diffDataTwice;
            };
    
            // Function to identify ARIMA model parameters
            const identifyArimaParams = (data, maxLag) => {
                // Perform second-order differencing on the data
                const diffDataTwice = differenceDataTwice(data);
    
                // Perform ADF test on doubly differenced data to check for stationarity
                const { isStationary } = adfTestForStationarity(diffDataTwice);
    
                if (!isStationary) {
                    console.log('The doubly differenced data is not stationary. Consider other transformations.');
                    return { p: null, d: null, q: null };
                }
    
                // Calculate ACF and PACF values for the doubly differenced data
                const acfValues = acf(diffDataTwice, maxLag);
                const pacfValues = pacf(diffDataTwice, maxLag);
    
                console.log('ACF (Doubly Differenced Data):', acfValues);
                console.log('PACF (Doubly Differenced Data):', pacfValues);
    
                // Identify ARIMA parameters based on ACF and PACF plots or rules
                // For simplicity, we can manually analyze the plots or apply rules to determine the parameters
    
                const p = 1; // AR order
                const d = 2; // Differencing order (second-order differencing)
                const q = 1; // MA order
    
                return { p, d, q };
            };
    
            // Determine ARIMA parameters
            const maxLag = 5; // Set the maximum lag for ACF and PACF
            const arimaParams = identifyArimaParams(data, maxLag);
            console.log('Identified ARIMA Parameters:', arimaParams);
    
            return data;
        } catch (e) {
            console.error(e);
            return e;
        }
    }
}