const TableData = [
    {
        id: '1',
        frontsymbol: 'R$',
        amount: '170.900',
        title: 'Saldo Atual',
        symbol: '',
        rate: '',
        color: 'success',
        icon: 'bank',
        iconcolor: 'primary',
        arrowicon: 'arrow-up',
        rangevalue: 100
    },
    {
        id: '2',
        frontsymbol: 'R$',
        amount: '0',
        title: 'Recebidos',
        symbol: '',
        rate: '',
        color: '',
        icon: 'wallet',
        iconcolor: 'primary',
        arrowicon: '',
        rangevalue: 100
    },
    {
        id: '3',
        amount: '0',
        frontsymbol: 'R$',
        title: 'A Receber',
        symbol: '',
        rate: '100',
        color: '',
        icon: 'wallet',
        iconcolor: 'primary',
        arrowicon: 'arrow-up',
        rangevalue: 100
    },
    {
        id: '4',
        amount: '0',
        title: 'Despesas',
        frontsymbol: 'R$',       
        rate: '',
        color: 'danger',
        icon: 'rocket-launch',
        iconcolor: 'primary',
        arrowicon: 'arrow-down',
        rangevalue: 100
    },
    {
        id: '5',
        amount: '0',
        frontsymbol: 'R$',
        title: 'Vencidos',
        rate: '',
        color: 'success',
        icon: 'warning-octagon',
        iconcolor: 'primary',
        arrowicon: 'arrow-up',
        rangevalue: 100
    },
]

//CONTAS A RECEBER
const leadData = [
    {
        id: '1',
        lcto: '09/08/2025',
        description: 'Comissão IFB', 
        valor: 1290
    },
    
]

//CONTAS BANCARIAS
const dealData = [
    {
        id: '1',
        img: 'https://t2.tudocdn.net/625915?w=1200&h=1200',
        title: 'BRADESCO',
        subtitle: 'Criado em 09/08/2025',
        price: 'R$170.900,00'
    }   
]

const taskData = [
    {
        id: '1',
        title: 'Review and make sure nothing slips through cracks',
        content: 'If someone cracks, they lose control of their emotions or actions because they are under a lot of pressure.',
        date: '15 Sep, 2023'
    },
    {
        id: '2',
        title: 'Send meeting invites for sales campaign',
        content: 'I will send you a meeting invite" is grammatically incorrect. Invite is a verb and invitation is the noun.',
        date: '20 Sep, 2023'
    },
    {
        id: '3',
        title: 'Make a creating an account profile',
        content: 'Like any other essay, a profile essay has three main parts, the introduction, body, and conclusion.',
        date: '08 Feb, 2023'
    },
    {
        id: '4',
        title: 'Change email option process',
        content: "If people have you saved as something else in their contacts, that's the name they'll see.",
        date: '19 Jan, 2023'
    },
    {
        id: '5',
        title: 'Additional Calendar',
        content: 'Employees can use shared calendars to manage their own assignments and appointments',
        date: '03 Jan, 2023'
    },
]

export { TableData, leadData, dealData, taskData }