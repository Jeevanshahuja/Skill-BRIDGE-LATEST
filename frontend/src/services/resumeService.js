import API from "./api";

export const uploadResume = async (formData) => {
  const res = await API.post("/resume/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const matchResume = async (
  resumeId,
  jobTitle,
  jobDescription
) => {

  const body = {
    ResumeId: resumeId,
    JobTitle: jobTitle,
    JobDescription: jobDescription,
  };

  console.log("REQUEST BODY:", body);

  const res = await API.post("/resume/match", body);

  return res.data;
};