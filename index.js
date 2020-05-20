#!/usr/bin/env node

const args = require('minimist')(process.argv.slice(2));
const fs = require('fs').promises;

const filePath = args._[0];
if (!filePath.endsWith('.json')) {
  throw Error('Script can only process json files on LHR format');
}

// open json
const file = fs
  .readFile(filePath, 'utf8')
  .catch(error => {
    // TODO: fail gracefully
    throw error;
  })
  .then(text => {
    const {categories} = JSON.parse(text);
    const threshold = Math.max(1, parseFloat(args.threshold) || 0.8);
    const fileOutputPath = args.o;

    const results = {};

    results.performance = categories.performance.score >= threshold;
    results.accessibility = categories.accessibility.score >= threshold;
    results.bestPractices = categories['best-practices'].score >= threshold;
    results.seo = categories.seo.score >= threshold;
    results.pwa = categories.pwa.score >= threshold;

    // Count failures by summing falseful values
    const failures = Object.values(results).reduce(
      (acc, value) => (!value ? acc + 1 : acc),
      0,
    );

    // get NOW date iso string
    const date = new Date();
    const dateString = date.toISOString();

    // write report xml
    let reportXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite id="0" name="lighthouse audit" errors="0" hostname="localhost" tests="5" failures="0" timestamp="${dateString}">
    <properties>
    </properties>
    <testcase classname="Performance" name="score >= ${threshold}" time="0">
    ${
      results.performance
        ? ''
        : `      <failure message="Performance score was less the threshold(${threshold})">Check full report for more info.</failure>`}
    </testcase>
    <testcase classname="Acessibility" name="score >= ${threshold}" time="0">
    ${
      results.accessibility
        ? ''
        : `      <failure message="Acessibility score was less the threshold(${threshold})">Check full report for more info.</failure>`}
    </testcase>
    <testcase classname="Best Practices" name="score => ${threshold}" time="0">
    ${
      results.bestPractices
        ? ''
        : `      <failure message="Best Practices score was less the threshold(${threshold})">Check full report for more info.</failure>`}
    </testcase>
    <testcase classname="SEO" name="score => ${threshold}" time="0">
    ${
      results.seo
        ? ''
        : `      <failure message="SEO score was less the threshold(${threshold})"> </failure>`}
    </testcase>
    <testcase classname="PWA" name="score >= ${threshold}" time="0">
    ${
      results.pwa
        ? ''
        : `      <failure message="PWA score was less the threshold(${threshold})"> </failure>`}
    </testcase>
    <system-out/>
    <system-err/>
  </testsuite>
</testsuites>`;

    // write file on disc
    if (fileOutputPath) {
      fs.writeFile(fileOutputPath, reportXml)
        .catch(error => {
          // TODO: fail gracefully
          throw error;
        })
        .then(() => {
          // My job here is done!
          process.exit(0);
        });
    } else {
      console.log(reportXml);
    }
  });
