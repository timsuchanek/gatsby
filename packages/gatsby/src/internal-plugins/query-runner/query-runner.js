import { graphql as graphqlFunction } from "graphql"
const fs = require(`fs`)
const Promise = require(`bluebird`)

const writeFileAsync = Promise.promisify(fs.writeFile)
const { boundActionCreators } = require(`../../redux/actions`)

const { store } = require(`../../redux`)

const makeJobId = page => `runPathQuery: ${page.path}`
// Run query for a page
module.exports = async (page, component) => {
  const { schema, program, jobs } = store.getState()

  const graphql = (query, context) =>
    graphqlFunction(schema, query, context, context, context)

  const jobId = makeJobId(page)

  // If this page's query is already being processed, return.
  if (jobs.active.some(j => j.id === jobId)) {
    return
  }

  // Run query
  let result

  // Nothing to do if the query doesn't exist.
  if (!component.query || component.query === ``) {
    result = {}
  } else {
    console.log(`creating job runPathQuery ${page.path}`)
    boundActionCreators.createJob({ id: jobId }, { name: `query-runner.js` })
    result = await graphql(component.query, { ...page, ...page.context })

    console.log(`ending job runPathQuery ${page.path}`)
    boundActionCreators.endJob({ id: jobId }, { name: `query-runner.js` })
  }

  // If there's a graphql errort then log the error. If we're building, also
  // quit.
  if (result && result.errors) {
    console.log(``)
    console.log(`The GraphQL query from ${component.componentPath} failed`)
    console.log(``)
    console.log(`Query:`)
    console.log(component.query)
    console.log(``)
    console.log(`GraphQL Error:`)
    console.log(result.errors)
    // Perhaps this isn't the best way to see if we're building?
    if (program._name === `build`) {
      process.exit(1)
    }
  }

  // Add the path context onto the results.
  result.pathContext = page.context
  const resultJSON = JSON.stringify(result, null, 4)
  return writeFileAsync(
    `${program.directory}/.cache/json/${page.jsonName}`,
    resultJSON
  )
}
