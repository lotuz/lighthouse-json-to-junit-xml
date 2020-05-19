# CLI util to convert lighthouse json report to junit xml format

This code was done with the simple goal of broadly visualizing if the
lighthouse has yielded better than $threshold values for the 5 big
lighthouse test categories (performance, a11y, best practices, seo, pwa)
inside gitlab's pipeline UI

There are no plans to fully convert LHR into junit format, but it seems
possible to create a better report than just the five categories by
adding a condition to each of LH's tests as a testcase.

## Usage

./lighthouse-xml-to-junit-xml.js [--threshold=0.8] [-o output.xml] lighthouse-report.json
