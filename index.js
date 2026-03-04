const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

morgan.token('req-body', (req) => {
  return JSON.stringify(req.body, null, 2)
})

morgan.token('customStatus', (req, res) => {
  if (res.statusCode.toString() === '200') {
    return '*200 OK!*'
  } else if (res.statusCode.toString() === '400') {
    return '*400 ERROR!*'
  } else {
    return res.statusCode.toString()
  }
})

app.use((req, res, next) => {
  if (req.method === 'POST') {
    morgan(':method :url :customStatus :res[content-length] - :response-time ms :req-body')(req, res, next)
  } else {
    morgan('tiny')(req, res, next)
  }
})

  /* 
  {
    locationId: string,
    propertyId: string,
    meterSerialNumber: string,
    address: string,
    postNumber", int,
    postLocation", string,
    reportType" : string,
    // UUSI PIENTUOTANTO / MUUTOSILMOITUS
    reportDate: string, // (ISO 8601 format),
    ownerInfo: {
      companyName: string,
      yTunnus: string,
      firstName: string,
      lastName: string,
      email: string,
      phone: string
    },
    contactPerson: {
      firstName: string,
      lastName: string,
      email: string,
      phone: string
    },
    contractor: {
      companyName: string,
      tukesNumber: string,
      // sisältääkö numero esim väliviivoja 15563-636
      firstName: string,
      lastName: string,
      email: string,
      phone: string
    },
    devices: [
      {
        productionType: string,
        // AURINKOVOIMA / DIESELVOIMA / TUULIVOIMA/ ENERGIAVARASTO
        currentProductionPower: int,
        inverterName: string,
        inverterModel: string,
        inverterStructure: string,
        // HYBRIDI-INVERTTERI / ERILLISET INVERTTERIT
        inverterACPower: int,
        hardwareConnection: string, 
        // Kolmivaiheinen / L1 / L2 / L3
        faultCurrent: int,
        shortCircuitCurrent: int
      }
    ],
    productionHardwareMeetsStandards: boolean,
    locationHasIsolationSwitch: boolean,
    isolationSwitchLocation: string,
    locationHasWarningSigns: boolean,
    locationHasInterfaceProtection: boolean,
    interfaceProtectionLocation: string,
    reactivePowerConpensation: boolean
   }
  */

let reports = [
  {
    id: 1,
    locationId: "123-1232",
    propertyId: "21415-123",
    meterSerialNumber: "151515-123",
    address: "Testikatu 1, 00100 Helsinki",
    postNumber: 10100,
    postLocation: "Helsinki",
    reportType : "UUSI PIENTUOTANTO",
    
    reportDate: "2023-10-10T00:00:00Z",
    ownerInfo: {
      companyName: "",
      yTunnus: "",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890"
    },
    contactPerson: {
      firstName: "Jack",
      lastName: "Bauer",
      email: "jack.bauer@example.com",
      phone: "123-456-7890"
    },
    contractor: {
      companyName: "Company Oy",
      tukesNumber: "15563-636",
      firstName: "Steven",
      lastName: "Doe",
      email: "steven.doe@example.com",
      phone: "123-456-7890"
    },
    devices: [
      {
        productionType: "AURINKOVOIMA",
        currentProductionPower: 4,
        inverterName: "Inverter 1",
        inverterModel: "Model A",
        inverterStructure: "HYBRIDI-INVERTTERI",
        inverterACPower: 4,
        hardwareConnection: "Kolmivaiheinen",
        faultCurrent: 10,
        shortCircuitCurrent: 20
      },
      {
        productionType: "ENERGIAVARASTO",
        currentProductionPower: 4,
        inverterName: "Inverter 2",
        inverterModel: "Model B",
        inverterStructure: "ERILLISET INVERTTERIT",
    
        inverterACPower: 4,
        hardwareConnection: "L2",
        faultCurrent: 10,
        shortCircuitCurrent: 20
      }
    ],
    productionHardwareMeetsStandards: true,
    locationHasIsolationSwitch: true,
    isolationSwitchLocation: "In the back - look for the red switch",
    locationHasWarningSigns: true,
    locationHasInterfaceProtection: true,
    interfaceProtectionLocation: "In the front - look for the blue box",
    reactivePowerConpensation: true
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/reports', (request, response) => {
  response.json(reports)
})

app.get('/api/reports/:id', (request, response) => {
  const id = request.params.id
  const report = reports.find(report => report.id === id)

  if (report) {
    response.json(report)
  } else {
    response.status(404).end()
  }
})

const generateId = () => {
  const maxId = reports.length > 0
    ? Math.max(...reports.map(r => Number(r.id)))
    : 0
  return String(maxId + 1)
}

app.post('/api/reports', (request, response) => {
  const body = request.body

  const report = {
    id: generateId(),
    locationId: body.locationId,
    propertyId: body.propertyId,
    meterSerialNumber: body.meterSerialNumber,
    address: body.address,
    postNumber: body.postNumber,
    postLocation: body.postLocation,
    reportType : body.reportType,
    reportDate: new Date(),
    ownerInfo: {
      companyName: body.ownerInfo.companyName,
      yTunnus: body.ownerInfo.yTunnus,
      firstName: body.ownerInfo.firstName,
      lastName: body.ownerInfo.lastName,
      email: body.ownerInfo.email,
      phone: body.ownerInfo.phone
    },
    contactPerson: {
      firstName: body.contactPerson.firstName,
      lastName: body.contactPerson.lastName,
      email: body.contactPerson.email,
      phone: body.contactPerson.phone
    },
    contractor: {
      companyName: body.contractor.companyName,
      tukesNumber: body.contractor.tukesNumber,
      firstName: body.contractor.firstName,
      lastName: body.contractor.lastName,
      email: body.contractor.email,
      phone: body.contractor.phone
    },
    devices: body.devices,
    productionHardwareMeetsStandards: body.productionHardwareMeetsStandards,
    locationHasIsolationSwitch: body.locationHasIsolationSwitch,
    isolationSwitchLocation: body.isolationSwitchLocation,
    locationHasWarningSigns: body.locationHasWarningSigns,
    locationHasInterfaceProtection: body.locationHasInterfaceProtection,
    interfaceProtectionLocation: body.interfaceProtectionLocation,
    reactivePowerConpensation: body.reactivePowerConpensation,     
  }

  reports = reports.concat(report)

  response.json(report)
})

app.delete('/api/reports/:id', (request, response) => {
  const id = request.params.id
  reports = reports.filter(report => report.id !== id)

  response.status(204).end()
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})