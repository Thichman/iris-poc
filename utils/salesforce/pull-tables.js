import jsforce from 'jsforce';

export async function fetchSalesforceTables() {
    console.log('Logging in...');
    const conn = new jsforce.Connection({
        loginUrl: 'https://login.salesforce.com'
    });

    await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD, process.env.SF_SECURITY_TOKEN);
    console.log('Logged in!');
    const result = await conn.describeGlobal();
    const tables = result.sobjects.map(obj => obj.name);

    return tables;
}
