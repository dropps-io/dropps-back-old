export interface StandardInterface {
    id: string,
    code: string,
    name: string
}

export const standardInterfaces: StandardInterface[] = [
    {id: '0x9a3bfe88', code: 'LSP0', name: 'Universal Profile'},
    {id: '0xc403d48f', code: 'LSP6', name: 'Key Manager'},
    {id: '0xe33f65c3', code: 'LSP7', name: 'Digital Asset'},
    {id: '0x49399145', code: 'LSP8', name: 'Identifiable Digital Asset'}
];

export const UNKNOWN_CONTRACT_INTERFACE: StandardInterface = {id: '0x', name: 'Unknown', code: 'Unknown'}
