require('dotenv').config();

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const { db } = require('./firebaseAdmin')

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

// GET all reports
app.get('/api/reports', async (request, response) => {
  try {
    const reportsRef = db.ref('reports') // Reference to the 'reports' node in your database
    const snapshot = await reportsRef.once('value') // Get a snapshot of all data under 'reports'
    const reportsData = snapshot.val() // Get the data as a JavaScript object

    if (reportsData) {
      // Firebase returns an object of objects, so convert it to an array
      const reportsArray = Object.keys(reportsData).map(key => ({
        id: key, // Use the Firebase-generated key as the report ID
        ...reportsData[key]
      }))
      response.json(reportsArray)
    } else {
      response.json([]) // Return an empty array if no reports exist
    }
  } catch (error) {
    console.error('Error fetching reports:', error)
    response.status(500).json({ error: 'Failed to retrieve reports.' })
  }
})


// GET a single report by ID
app.get('/api/reports/:id', async (request, response) => {
  try {
    const id = request.params.id
    const reportRef = db.ref('reports/' + id) // Reference to a specific report by its Firebase ID
    const snapshot = await reportRef.once('value')
    const reportData = snapshot.val()
    if (reportData) {
      response.json({ id: id, ...reportData }) // Include the ID in the response
    } else {
      response.status(404).json({ error: 'Report not found.' })
    }
  } catch (error) {
    console.error('Error fetching report by ID:', error)
    response.status(500).json({ error: 'Failed to retrieve report.' })
  }
})


// POST a new report
app.post('/api/reports', async (request, response) => {
  const body = request.body
  // Basic validation (you should add more robust validation)
  if (!body.locationId || !body.propertyId || !body.meterSerialNumber) {
    return response.status(400).json({
      error: 'Missing required fields: locationId, propertyId, or meterSerialNumber'
    })
  }

  // Create the report object as before, but Firebase will generate the ID
  const newReportData = {
    locationId: body.locationId,
    propertyId: body.propertyId,
    meterSerialNumber: body.meterSerialNumber,
    address: body.address,
    postNumber: body.postNumber,
    postLocation: body.postLocation,
    reportType: body.reportType,
    reportDate: new Date().toISOString(),
    ownerInfo: {
      companyName: body.ownerInfo?.companyName,
      yTunnus: body.ownerInfo?.yTunnus,
      firstName: body.ownerInfo?.firstName,
      lastName: body.ownerInfo?.lastName,
      email: body.ownerInfo?.email,
      phone: body.ownerInfo?.phone
    },
    contactPerson: {
      firstName: body.contactPerson?.firstName,
      lastName: body.contactPerson?.lastName,
      email: body.contactPerson?.email,
      phone: body.contactPerson?.phone
    },
    contractor: {
      companyName: body.contractor?.companyName,
      tukesNumber: body.contractor?.tukesNumber,
      firstName: body.contractor?.firstName,
      lastName: body.contractor?.lastName,
      email: body.contractor?.email,
      phone: body.contractor?.phone
    },
    devices: body.devices,
    currentPowerProductionTotal: body.currentPowerProductionTotal,
    productionDifferenceToLastSetup: body.productionDifferenceToLastSetup,
    productionHardwareMeetsStandards: body.productionHardwareMeetsStandards,
    locationHasIsolationSwitch: body.locationHasIsolationSwitch,
    isolationSwitchLocation: body.isolationSwitchLocation,
    locationHasWarningSigns: body.locationHasWarningSigns,
    locationHasInterfaceProtection: body.locationHasInterfaceProtection,
    interfaceProtectionLocation: body.interfaceProtectionLocation,
    reactivePowerConpensation: body.reactivePowerConpensation,
  }

  try {
    const reportsRef = db.ref('reports')
    const newReportRef = reportsRef.push(newReportData) // Push creates a new child node with a unique ID
    const newReportId = newReportRef.key // Get the Firebase-generated ID
    response.status(201).json({ id: newReportId, ...newReportData }) // Respond with the new report including its ID
  } catch (error) {
    console.error('Error creating new report:', error)
    response.status(500).json({ error: 'Failed to create report.' })

  }
})

// DELETE a report
app.delete('/api/reports/:id', async (request, response) => {
  try {
    const id = request.params.id
    const reportRef = db.ref('reports/' + id)
    // Check if the report exists before trying to delete
    const snapshot = await reportRef.once('value')
    if (!snapshot.exists()) {
      return response.status(404).json({ error: 'Report not found.' })
    }
    await reportRef.remove() // Remove the specific report
    response.status(204).end() // 204 No Content for successful deletion
  } catch (error) {
    console.error('Error deleting report:', error)
    response.status(500).json({ error: 'Failed to delete report.' })
  }
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})