const Alumni =required('../model/alumni.model')

exports.searchAlumni = async (req, res) => {
  try {
    const { batchYear, industry, location, name, degree, skills } = req.query;

    const query = {};

    if (batchYear) query.batchYear = parseInt(batchYear); 
    if (industry) query.industry = { $regex: industry, $options: 'i' }; 
    if (location) query.location = { $regex: location, $options: 'i' }; 
    if (name) query.name = { $regex: name, $options: 'i' }; 
    if (degree) query.degree = { $regex: degree, $options: 'i' }; 
    if (skills) {
      query.skills = { 
        $elemMatch: { $regex: new RegExp(skills, 'i') }
      };
    }

    const alumniList = await Alumni.find(query).populate('userId', 'email role');

    return res.status(200).json({
      success: true,
      message: "Alumni search results retrieved successfully.",
      data: alumniList,
    });
  } catch (error) {
    console.error("Error searching alumni:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching alumni",
      error: error.message,
    });
  }
};