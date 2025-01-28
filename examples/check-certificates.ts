import 'dotenv/config';
console.log('Certificate:', process.env.AZUL_CERT?.substring(0, 50) + '...');
console.log('Key:', process.env.AZUL_KEY?.substring(0, 50) + '...');
