const standardInterfaces = [
    {id: '0x9a3bfe88', code: 'LSP0', name: 'Universal Profile'},
    {id: '0xc403d48f', code: 'LSP6', name: 'Key Manager'},
    {id: '0xe33f65c3', code: 'LSP7', name: 'Digital Asset'},
    {id: '0x49399145', code: 'LSP8', name: 'Identifiable Digital Asset'}
];

async function main() {
    // await indexBlockchain(6000);

    // console.log(generateJWT('0x742242E9572cEa7d3094352472d8463B0a488b80'));

    // const res = await executeQuery('SELECT contract.address FROM "contract" INNER JOIN contract_metadata ON contract.address=contract_metadata.address WHERE "interfaceCode" = $1 ORDER BY CASE name WHEN \'\' THEN 1 ELSE 0 END ASC LIMIT 100', ['LSP0']);
    // for (let profile of res.rows) {
    //     await insertFollow('0x742242E9572cEa7d3094352472d8463B0a488b80', profile.address);
    // }

    // await insertMethodDisplay('0x7e71433d', 'Received {value}LYX from {sender}', '', '', '');

    // const posts = await queryPostsOfUser('0x2b4C446E67A24f15fC37e3a190D33B679eFd6e26', 4000, 0);
    // const feed = await constructFeed(posts);
    // feed.forEach(f => console.log(f.display));
}

main();