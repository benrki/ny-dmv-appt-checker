const fetch = require("node-fetch");
const branchList = require("./branchlist");

const boroughs = ["Manhattan", "Queens", "Staten Island", "Brooklyn"];
const validBranches = branchList.filter(
  ({ name }) => boroughs.filter((b) => name.indexOf(b) != -1).length
);
const service =
  "10226f4de0f460aa67bb735db97f9eb434b8ac2a144e40a20ff1e1848ffbeae7";
const URLS = {
  availabilities: (branch, service, date = new Date().getTime()) =>
    `https://nysdmvqw.us.qmatic.cloud/qwebbook/rest/schedule/branches/${branch}/services/${service}/dates?_=${date}`,
};

const getDatesForBranch = ({ name, id }) =>
  fetch(URLS.availabilities(id, service))
    .then((res) => res.json())
    .catch(() => [])
    .then((dates) => ({ name, dates: dates.map(({ date }) => date) }));

async function main() {
  const availabilities = await Promise.all(
    validBranches.map(getDatesForBranch)
  );

  return JSON.stringify(
    availabilities
      .reduce((acc, { name, dates }) => {
        dates.forEach((date) => acc.push({ name, date }));
        return acc;
      }, [])
      .sort((a, b) => a.date.replace(/-/g, "") - b.date.replace(/-/g, ""))
      .slice(0, 5),
    null,
    2
  );
}

main().then(console.log);
