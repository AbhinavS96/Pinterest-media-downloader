This is a chrome extension that extends Pinterest's feature set by allowing the user to download images and videos. It is made purely for fun and has no monetization model attached to it.

<br>

The source is mainly in TypeScript and is transpiled into Javascript using Gulp.js. 

Get started:

<ol>
    <li>Install dependancies: npm install</li>
    <li>To generate dev version (the task will keep running as you keep making changes): npm run dev</li>
    <li>To generate production version: npm run prod</li>
    <li>The code will be generated inside /dist. <a href="https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked">Load unpacked</a> extension to Chrome to test</li>
</ol>

<br>

The manifest.json and manifest.PROD.json are meant to be used as different environments (same with config.json and config.PROD.json) but currently are the same. The appropriate file should be edited depending on whether you are generating the dev version or the prod version. 
