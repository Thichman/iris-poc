import jsforce from 'jsforce';

const conn = new jsforce.Connection({
    loginUrl: 'https://login.salesforce.com'
});

const login = async () => await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD);

export { login, conn };
