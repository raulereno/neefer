import React, { useState } from "react";
import Dropzone from "./Dropzone";
import axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import Swal from "sweetalert2";

const newNTF = {
  name: "",
  description: "",
  email: "",
  chain: "",
};

const CreateNFT = () => {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState(newNTF);
  let img_urls = [];
  let responsePost = {};

  const uploadImgs = async () => {
    const formData = new FormData();

    for (const file of files) {
      formData.append("file", file);
      formData.append("api_key", 628629743876863); //TODO:
      formData.append("upload_preset", "h4e9cy2g");

      await axios
        .post("https://api.cloudinary.com/v1_1/dbgpp8nla/upload", formData) //TODO: cambiar cloud name por variable de entorno
        .then((data) => {
          img_urls.push(data.data.secure_url);
        })
        .catch((err) => console.log(err));
    }
  };

  const mintNTF = async (e) => {
    e.preventDefault();

    await uploadImgs();

    if (!img_urls.length) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please insert a less one image",
      });
      return;
    }

    const data = JSON.stringify({
      recipient: `email:${form.email}:${
        form.chain.includes("solana") ? "solana" : "polygon"
      }`,
      metadata: {
        name: form.name,
        image: img_urls.shift(),
        description: form.description,
        properties: img_urls.map((link) => {
          return { uri: link, type: "image/png" };
        }),
        attributes: [
          {
            trait_type: "sun_size",
            value: "l",
          },
          {
            trait_type: "sun_pos",
            value: "center",
          },
          {
            trait_type: "terrain",
            value: "flat",
          },
        ],
        // propierties: [
        //   {
        //     uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Amazona_auropalliata_-Roatan_Tropical_Butterfly_Garden-8a.jpg/220px-Amazona_auropalliata_-Roatan_Tropical_Butterfly_Garden-8a.jpg",
        //     type: "image/png",
        //   },
        //   {
        //     uri: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Scarlet_Macaw_and_Blue-and-gold_Macaw.jpg",
        //     type: "image/png",
        //   },
        // ],
      },
    });

    await axios
      .post(
        `https://staging.crossmint.com/api/2022-06-09/collections/${form.chain}/nfts`,
        data,
        {
          headers: {
            "content-type": "application/json",
            "x-client-secret":
              "sk_test.i9f7CYrR.6eGjty29HydOTEAiZAVxHEgVzhMqW8ub",
            "x-project-id": "07bbbdba-7eda-4e75-bfcb-ce279c7e312a",
          },
        }
      )
      .then((data) => {
        console.log(data);
        responsePost = data;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const inputHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    if (name === "chain") {
      setForm({ ...form, [name]: value });
    } else if (name === "properties_key" || name === "properties_value") {
      setForm({ ...form, [name]: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  return (
    <div id="container_create">
      <h1>Create a single NFT</h1>

      <div>
        <h2>Upload files</h2>
        <p>
          <b>Upload all files you want to mint</b>
        </p>
        <Dropzone files={files} setFiles={setFiles} />
        <p>Max.50 MB per individual file.</p>
        <p>Upload up to 6 files</p>
        <p>We support image,audio and video files.</p>
      </div>
      <button onClick={() => console.log(img_urls)}>see img</button>
      <button onClick={uploadImgs}>Upload img</button>
      <div>
        <h2>Token details</h2>
        <p>
          The 'Display name' and 'Description' will be shown in wallets or on
          marketplaces, where the NFT is displayed. This information is also
          store on the blockchain
        </p>
        <form onSubmit={mintNTF}>
          <input
            type="text"
            placeholder="Display name (max.60)"
            onChange={inputHandler}
            value={form.name}
            name="name"
          />
          <textarea
            name="description"
            id=""
            cols="30"
            rows="10"
            placeholder="Decription (max.200)"
            maxLength="200"
            onChange={inputHandler}
            value={form.description}
          ></textarea>
          <input
            type="email"
            name="email"
            id=""
            placeholder="Email"
            onChange={inputHandler}
            value={form.email}
          />
          <div>
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
          <div>
            <p>Properties:</p>
            <input
              type="text"
              name="properties_key"
              id=""
              placeholder="Eg. Body"
              onChange={inputHandler}
            />
            <input
              type="text"
              name="properties_value"
              id=""
              placeholder="Eg. Figther "
              onChange={inputHandler}
            />
          </div>
          <button type="submit">Mint NFT</button>
        </form>
      </div>
    </div>
  );
};

export default CreateNFT;
