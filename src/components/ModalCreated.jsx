import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Dna } from "react-loader-spinner";

const CROSSMINT_CLIENT_SECRET = process.env.REACT_APP_CROSSMINT_CLIENT_SECRET;
const CROSSMINT_PROJECT_ID = process.env.REACT_APP_CROSSMINT_PROJECT_ID;

function Example({ open, setOpen, data }) {
  const handleClose = () => {
    setOpen(false);
    setResponse(null);
  };
  const [response, setResponse] = useState(null);

  const fetchingData = () => {
    axios
      .get(
        `https://staging.crossmint.com/api/2022-06-09/collections/default-${data.data.onChain.chain}/nfts/${data.data.id}`,
        {
          headers: {
            "content-type": "application/json",
            "x-client-secret": CROSSMINT_CLIENT_SECRET,
            "x-project-id": CROSSMINT_PROJECT_ID,
          },
        }
      )
      .then((data) => {
        if (data.data.onChain.status === "pending") {
          setTimeout(() => {
            fetchingData();
          }, 10000);
        } else {
          setResponse(data.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (Object.keys(data).length) {
      fetchingData();
    }
  }, [data]);

  return (
    <>
      <Modal
        show={open}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>New NFT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="container_modal">
            {response === null ? (
              <>
                <h1>Creating NFT...</h1>
                <Dna
                  visible={true}
                  height="300"
                  width="300"
                  ariaLabel="dna-loading"
                  wrapperStyle={{}}
                  wrapperClass="dna-wrapper"
                />
              </>
            ) : (
              <>
                <h1>{response.metadata.name}</h1>
                <div className="container_description">
                  <div>
                    <img
                      id="main_image"
                      src={response.metadata.image}
                      alt=""
                      srcset=""
                    />
                    <div className="secondary_pics">
                      {response.metadata.properties.files.map((element) => {
                        return <img src={element.uri} alt="" />;
                      })}
                    </div>
                  </div>
                  <div className="description">
                    <h3>Description:</h3>
                    <p>{response.metadata.description}</p>
                  </div>
                </div>
                <h3>Properties</h3>
                <div className="container_properties">
                  {response.metadata.attributes.map((element) => {
                    return (
                      <div className="properties">
                        <p className="key">{element.trait_type}</p>
                        <p className="value">{element.value}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="container_details">
                  <h3>Details</h3>
                  <p>
                    {response.onChain.contractAddress
                      ? `Contract Adress:${response.onChain.contractAddress}`
                      : `Mint Hash: ${response.onChain.mintHash}`}
                  </p>
                  <p>
                    {response.onChain.tokenId
                      ? `Token ID: ${response.onChain.tokenId}`
                      : ""}
                  </p>
                  <p>Chain: {response.onChain.chain}</p>
                </div>
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Example;
