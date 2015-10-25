## Intro
Example of Event Sourcing and CQRS with pinball.js

Install node >= v4.0.0 (https://nodejs.org).

```
git clone event-sourcing-cqrs
npm install
node index.js
# or
DEBUG=* node index.js
```

## Todo
* add sqlite as event store
* add event subscribers
* add rolling snapshots
* add view table
* add unique constrain with external table (email of bank account)

## References
|||
--- | ---
https://msdn.microsoft.com/en-us/library/dn589792.aspx | event sourcing and CQRS
https://github.com/cer/event-sourcing-examples/wiki/DeveloperGuide | example in Scala/Java
