module.exports = testPaths => {

  function filteringFunction(e) { return false }

  testPaths.forEach(e => console.log(e))

  const allowedPaths = testPaths
    .filter(filteringFunction)
    .map(test => ({test})); // [{ test: "path1.spec.js" }, { test: "path2.spec.js" }, etc]

  return {
    filtered: allowedPaths,
  };
};
