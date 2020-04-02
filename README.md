# req-meta-middleware

An Express middleware for parsing various request metadata. The following data are parsed from the request object:
- Referer information using database from [referer-parser](https://github.com/snowplow-referer-parser/referer-parser)
- UTM tags
- IP address and its [geoip](https://github.com/bluesmoon/node-geoip) info
- User-Agent using [ua-parser-js](https://github.com/faisalman/ua-parser-js)

## Installation
npm:
```sh
npm install req-meta-middleware
```
yarn:
```sh
yarn add req-meta-middleware
```

## Usage
Add inbound-middleware to your middleware stack.
Note that we need to `await` for the middleware to initialize.
```ts
import meta from 'req-meta-middleware';

const app = express();
// ...
app.use(await meta());
```
All parsed information is stored at `req.meta`.
```ts
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.inbound !== null) {
    console.log(req.inbound.referrer);
  }
 });
```

### Options
You can also specify options while initializing the middleware.
```ts
const options = {
   // Domains of the server (default: [])
  internalDomains: ['foo.com'],
  // When set to true, req IP will not be parsed and req.inbound.ip will be null. (default: false)
  skipIP: false,
  // When set to true, the referrer database will be fetched from the web. (default: true)
  // Otherwise, local database stored in data/referers.json will be used.
  webReferralDB: true,
  // Cron schedule string for updating the referrer database.
  // This is only effective when webReferralDB is true. (default: '0 0 0 * * * *')
  updateSchedule: '0 0 0 * * * *'
};
server.use(meta(options));
```
See the [node-cron](https://github.com/node-cron/node-cron) docs for the cron schedule syntax.

### Parsing after response
If `req.meta` isn't used for building responses, it may be faster in response time to parse the request after sending the response.
(eg. only using metadata for referral stats)
In that case, use `later` to parse metadata after the response has been sent.
```ts
const handler = (data) => {
  console.log(data);
};
server.use(await meta.later(handler, options));
```
The middleware will first call `next()` to further process the request, then parse and callback after the response has been sent.
