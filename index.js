require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');
const { createWriteStream, appendFileSync } = require('fs');

const date = new Date();
const fileNameByDate = `${date.getFullYear()}-${(date.getUTCMonth() + 1)}-${date.getDay()}-${date.getTime()}`;
const downloadPath = path.resolve(__dirname, 'downloads');
const outputsPath = path.resolve(__dirname, 'outputs');

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
  const urlEnterService = `${urlDeso}/exibirServicosPortalDesoAction.do`;
  const accountUser = process.env.DESO_MATRICULA;
  const cpfUser = process.env.DESO_CPF;
  const downloadBills = process.env.BAIXAR_CONTAS === 'true';

  try {
    console.log('Init loggin in..')
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(urlEnterService);

    const fieldMatricula = 'input[name="matricula"]';

    await page.waitForSelector(fieldMatricula);

    console.log('Putting the matricula value...');

    await page.$eval(`${fieldMatricula}`, (el, accountUser) => el.value = accountUser, accountUser);
    await Promise.all([
      page.waitForNavigation(),
      page.click('input[type="submit"]'),
    ]);
    
    console.log('Waiting for cpf field...');

    console.log('carregou');

    console.log('Putting the cpf value...');

    await page.$eval(`input[name="cpfCnpjSolicitante"]`, (el, cpfUser) => el.value = cpfUser, cpfUser);

    await Promise.all([
      page.waitForNavigation(),
      page.click('#solicitarCpfCnpj input[type=submit]'),
    ]);

    console.log('CPF filled. Waiting for validation...')

    const selectorBills = '#serv-2';

    await page.waitForSelector(selectorBills);

    console.log('Go to the bills...');

    await Promise.all([
      page.waitForNavigation(),
      page.click(selectorBills)
    ]);

    const bills = await page.evaluate(({ urlDeso }) => {
      const cells = document.querySelectorAll('table tbody tr');
      let dataReturn = [];

      for (item of cells) {
        const billDate = item.querySelector('td:first-child').innerText;
        const [year, month] = billDate.split('/');
        const value = item.querySelector('td:nth-child(2)').innerText;
        let linkDownload = item.querySelector('td:nth-child(3) a').getAttribute('href')
          .match(/\'gerarRelatorio2ViaContaAction.do+(.*)+\'/);
        
        if (linkDownload.length > 0) {
          linkDownload = linkDownload[0].replace(/\'/gi, '');
          linkDownload = `${urlDeso}/${linkDownload}`
        }

        const billData = {
          year,
          month,
          value,
          linkDownload,
        };

        dataReturn.push(billData);
      }

      return dataReturn;
    }, { urlDeso });

    console.log(`Searchs bill completed. Found ${bills.length} bill(s)`);
    
    appendFileSync(
      `${outputsPath}/output-${fileNameByDate}.json`,
      `\n${JSON.stringify(bills, null, 2)}`
    );

    if (downloadBills) {
      let index = 0;

      for (let item of bills) {
        if (item.linkDownload) {
          console.log(`Init downloading bill ${(index + 1)}`);

          const { data } = await axios({url: item.linkDownload, method: 'GET', responseType: 'stream'});
          data.pipe(createWriteStream(`${downloadPath}/bill-${index + 1}-${fileNameByDate}.pdf`));

          console.log(`Bill ${(index + 1)} saved!`);
        }

        index++;
      }
      
      console.log('Download bills...');
    }

    console.log('Finished!')
  
    await browser.close();
  
    return bills;
  } catch (err) {
    saveLog(err.toString(), true);
  
    return false;
  }
};

if (require.main === module) {
  return getBills().catch(err => console.log(err));
}

module.exports = getBills;