require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const { writeFileSync, appendFileSync, readFileSync } = require('fs');

const date = new Date();
const fileNameByDate = `${date.getFullYear()}-${(date.getUTCMonth() + 1)}-${date.getDay()}-${date.getTime()}`;
const downloadPath = './downloads/';
const outputsPath = './outputs/';

const saveLog = (data, error) => {
  appendFileSync(
    `${outputsPath}/error-${fileNameByDate}.log`,
    `\n[${(new Date).toString()}] - [${(error ? 'ERROR' : 'INFO')}] - ${data}`
  );

  console.log('\nError to proccess: ', data);
}

const getBills = async () => {
  console.log('Start get bills...');
  const urlDeso = process.env.DESO_URL_AGENCIA_VIRTUAL;
  const urlEnterService = 'exibirServicosPortalDesoAction.do';
  const urlGetBills = 'emitirSegundaViaContaPortalDesoAction.do';
};

if (require.main === module) {
  return getBills().catch(err => console.log(err));
}

module.exports = getBills;