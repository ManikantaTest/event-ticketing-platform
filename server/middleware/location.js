const location = (req, res, next) => {
  // Default location
  req.userLocation = { lat: 28.6139, lng: 77.209, label: "New delhi, Delhi" };
  // Override with cookie (guest user)
  if (req.cookies.userLocation) {
    try {
      req.userLocation = JSON.parse(req.cookies.userLocation);
    } catch {}
  }

  // Override with DB location if logged in
  if (req.user?.preferredLocation) {
    req.userLocation = {
      lat: req.user.preferredLocation.coordinates[1], // [lng, lat] → lat
      lng: req.user.preferredLocation.coordinates[0], // [lng, lat] → lng
      label: req.user.preferredLocation.label,
    };
  }

  next();
};

module.exports = location;
