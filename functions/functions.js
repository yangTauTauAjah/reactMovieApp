function errorHandler(err, res) {

  console.error(err)
  res.status(500).json({ message: err.message })

}

function response(res, status = 200, message = '', data = {}, header) {

  const toSend = res.status(status)

  if (header) {
    for (let key in header) {
      toSend.set(key, header[key])
    }
  }

  return toSend.json({message, data})

}

function parseCookie(cookie) {
  const cookieObject = {};
  if (cookie) {
    const cookieValues = cookie.split(';');
    for (const value of cookieValues) {
      const [name, val = 'true'] = value.split('=');
      cookieObject[name.trim()] = val.trim();
    }
  }
  return cookieObject;
}

module.exports = {errorHandler, response, parseCookie}