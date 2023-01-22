import React, { useState } from "react";
import Dropzone from "./Dropzone";
import axios from "axios";
import Swal from "sweetalert2";
import Example from "./ModalCreated";
import { validateSend } from "../const/validateSend";

const API_KEY_CLOUDINARY = process.env.REACT_APP_CLOUDINARY_API_KEY;
const API_PRESET_CLOUDINARY = process.env.REACT_APP_CLOUDINARY_API_PRESET;
const API_CLOUDNAME_CLOUDINARY = process.env.REACT_APP_CLOUDINARY_API_CLOUDNAME;
const CROSSMINT_CLIENT_SECRET = process.env.REACT_APP_CROSSMINT_CLIENT_SECRET;
const CROSSMINT_PROJECT_ID = process.env.REACT_APP_CROSSMINT_PROJECT_ID;

const newNTF = {
  name: "",
  description: "",
  email: "",
  chain: "",
  properties: [{ key: "", value: "" }],
};

const CreateNFT = () => {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState(newNTF);
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState({});
  const [errors, setErrors] = useState({});

  let img_urls = [];

  const uploadImgs = async () => {
    const formData = new FormData();

    for (const file of files) {
      formData.append("file", file);
      formData.append("api_key", API_KEY_CLOUDINARY);
      formData.append("upload_preset", API_PRESET_CLOUDINARY);

      await axios
        .post(
          `https://api.cloudinary.com/v1_1/${API_CLOUDNAME_CLOUDINARY}/upload`,
          formData
        )
        .then((data) => {
          img_urls.push(data.data.secure_url);
        })
        .catch((err) => console.log(err));
    }
  };
  const addPropertie = () => {
    setForm({
      ...form,
      properties: [...form.properties, { key: "", value: "" }],
    });
  };

  const mintNTF = async (e) => {
    e.preventDefault();

    let aux = validateSend(form);

    if (Object.keys(aux).length) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please complete al requires field in the form",
      });
      setErrors(aux);
      return;
    }
    await uploadImgs();

    if (!img_urls.length) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please insert a less one image",
      });

      return;
    }
    setOpen(true);

    const data = JSON.stringify({
      recipient: `email:${form.email}:${
        form.chain.includes("solana") ? "solana" : "polygon"
      }`,
      metadata: {
        name: form.name,
        image: img_urls.shift(),
        description: form.description,
        properties: {
          files: img_urls.map((link) => {
            return { uri: link, type: "image/png" };
          }),
        },
        attributes: form.properties.map((element) => {
          return { trait_type: element.key, value: element.value };
        }),
      },
    });

    await axios
      .post(
        `https://staging.crossmint.com/api/2022-06-09/collections/${form.chain}/nfts`,
        data,
        {
          headers: {
            "content-type": "application/json",
            "x-client-secret": CROSSMINT_CLIENT_SECRET,
            "x-project-id": CROSSMINT_PROJECT_ID,
          },
        }
      )
      .then((data) => {
        setResponse(data);
        setForm(newNTF);
        setFiles([]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const inputHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setErrors({});
    if (name === "chain") {
      setForm({ ...form, [name]: value });
    } else {
      setForm({ ...form, [name]: value });
    }

    if (name.includes("properties_key")) {
      form.properties[name[name.length - 1]].key = value;
      setForm({ ...form, properties: form.properties });
    }
    if (name.includes("properties_value")) {
      form.properties[name[name.length - 1]].value = value;
      setForm({ ...form, properties: form.properties });
    }
  };

  return (
    <div id="container_create">
      <h1>Create a single NFT</h1>

      <div className="container_dropzone">
        <h2>Upload files</h2>
        <h4>Upload all files you want to mint</h4>
        <Dropzone files={files} setFiles={setFiles} />
        <p>Max.50 MB per individual file.</p>
        <p>Upload up to 6 files</p>
        <p>
          We support image,audio and video files.
          <span
            data-bs-toggle="tooltip"
            data-bs-placement="right"
            title="Accepted files: JPG, PNG, MP4, GIF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-144c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z" />
            </svg>
          </span>
        </p>
      </div>
      <div id="container_form">
        <h2>Token details</h2>
        <p>
          The 'Display name' and 'Description' will be shown in wallets or on
          marketplaces, where the NFT is displayed. This information is also
          store on the blockchain
        </p>
        <form onSubmit={mintNTF}>
          <div id="input_name">
            <input
              type="text"
              placeholder="Display name (max.60)"
              onChange={inputHandler}
              value={form.name}
              name="name"
              className={`${errors.name && "input_error"}`}
            />
            <span>{errors?.name}</span>
          </div>
          <textarea
            name="description"
            id=""
            cols="30"
            rows="10"
            placeholder="Decription (max.200)"
            maxLength="200"
            onChange={inputHandler}
            value={form.description}
            className={`${errors.description && "input_error"}`}
          ></textarea>
          <span>{errors?.description}</span>
          <input
            type="email"
            name="email"
            id=""
            placeholder="Email"
            onChange={inputHandler}
            value={form.email}
            className={`email ${errors.email && "input_error"}`}
          />
          <span>{errors?.email}</span>
          <div>
            <div id="container_chain">
              <h4>Chain:</h4>
              <input
                type="radio"
                name="chain"
                id="radio_solana"
                onChange={inputHandler}
                value="default-solana"
              />
              <label htmlFor="radio_solana">Solana</label>
              <input
                type="radio"
                name="chain"
                id="radio_polygon"
                onChange={inputHandler}
                value="default-polygon"
              />
              <label htmlFor="radio_polygon">Polygon</label>
            </div>
            <span>{errors?.chain}</span>
          </div>
          <div className="container_properties">
            <h4>Properties:</h4>
            <ul>
              {form.properties?.map((element, i) => {
                if (form.properties.length - 1 === i) {
                  return (
                    <li key={i}>
                      <input
                        type="text"
                        name={`properties_key${i}`}
                        id=""
                        placeholder="Eg. Body"
                        onChange={inputHandler}
                        value={form.properties[i][element.key]}
                        className={`${errors.properties && "input_error"}`}
                      />
                      <input
                        type="text"
                        name={`properties_value${i}`}
                        id=""
                        placeholder="Eg. Figther"
                        onChange={inputHandler}
                        value={form.properties[i][element.value]}
                        className={`${errors.properties && "input_error"}`}
                      />
                      <button onClick={addPropertie} type="button">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                        </svg>
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={i}>
                    <input
                      type="text"
                      name={`properties_key${i}`}
                      id=""
                      placeholder="Eg. Body"
                      onChange={inputHandler}
                      value={form.properties[i].key}
                      className={`${errors.properties && "input_error"}`}
                    />
                    <input
                      type="text"
                      name={`properties_value${i}`}
                      id=""
                      placeholder="Eg. Figther"
                      onChange={inputHandler}
                      value={form.properties[i].value}
                      className={`${errors.properties && "input_error"}`}
                    />
                  </li>
                );
              })}
            </ul>
            <span>{errors?.properties}</span>
          </div>
          <button id="submit_button" type="submit">
            Mint NFT
          </button>
        </form>
      </div>
      <Example setOpen={setOpen} open={open} data={response} />
    </div>
  );
};

export default CreateNFT;
