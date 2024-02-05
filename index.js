const { GoogleSpreadsheet } = require("google-spreadsheet")
const credenciais = require("./credentials.json")
const { JWT } = require("google-auth-library")

const serviceAccountAuth = new JWT({
  email: credenciais.client_email,
  key: credenciais.private_key.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const doc = new GoogleSpreadsheet(
  "128R6Jqf3rwZlleS7nscN7ufVRTukGOnIFFkfMP7Pd8g",
  serviceAccountAuth
)

const loadSpreadsSheet = async () => {
  console.log("Loading spreadsheet info...")
  await doc.loadInfo()
  let sheet = doc.sheetsByIndex[0]

  console.log("Loading cells A3:H27...")
  await sheet.loadCells("A3:H27")

  const columnP1 = "D"
  const columnP2 = "E"
  const columnP3 = "F"
  const columnSituation = "G"
  const columnFouls = "C"
  const columnNaf = "H"
  const totalNumberOfClasses = 60

  let count = 4

  while (count <= 27) {
    console.log(`Processing row ${count}...`)
    let rowP1 = sheet.getCellByA1(`${columnP1}` + count).value
    let rowP2 = sheet.getCellByA1(`${columnP2}` + count).value
    let rowP3 = sheet.getCellByA1(`${columnP3}` + count).value
    let rowSituation = sheet.getCellByA1(`${columnSituation}` + count)
    let rowFouls = sheet.getCellByA1(`${columnFouls}` + count).value
    let rowNaf = sheet.getCellByA1(`${columnNaf}` + count)

    const percentageOfAbsences = (rowFouls / totalNumberOfClasses) * 100
    const average = (rowP1 + rowP2 + rowP3) / 3
    const naf = Math.round((5 * 2 - average) * -1)

    rowNaf.value = 0

    count++

    if (percentageOfAbsences > 25) {
      console.log(`Student in row ${count} failed due to absences.`)
      rowSituation.value = "Reprovado por Falta"
      continue
    } else if (average < 50) {
      console.log(`Student in row ${count} failed due to low score.`)
      rowSituation.value = "Reprovado por Nota"
    } else if (50 <= average && average < 70) {
      console.log(`Student in row ${count} is in final exam.`)
      rowNaf.value = naf
      rowSituation.value = "Exame Final"
    } else {
      console.log(`Student in row ${count} passed.`)
      rowSituation.value = "Aprovado"
    }
  }

  console.log("Saving updated cells...")
  await sheet.saveUpdatedCells()
}

loadSpreadsSheet()
  .then(() => console.log("Spreadsheet processing completed."))
  .catch((err) => console.log({ err }))
