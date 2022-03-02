import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home(props) {
  const qs = require("qs");
  const [location, setLocation] = useState(0);
  const [flowSelection, setFlowSelection] = useState(0);

  console.log(props.data);

  useEffect(() => {
    addAdditionalFilters("text")
  }, [flowSelection]);
  
  const addAdditionalFilters = async (val) => {
    console.log("ehllo");
    return <h1>Hello</h1>
  }



  const searchLocationbypostcode = async (val) => {
    const query = qs.stringify({
      sort: ["Name:asc"],
      populate: "*",
      filters: {
        Postcode: {
          $eq: val,
        },
      },
      fields: ["Name", "Postcode", "State", "Lattitude", "Longitude"],
    });

    // get posts from the api.
    try {
      const res = await fetch(`https://dev-strapi-mable.itelalabs.net/api/providers?${query}`, {
        method: `get`,
        headers: new Headers({
          'Authorization': 'Bearer 3d2991a1149d4d228d58d4ffaa96b8c2662142e01b6186f173d96ce96338534f460d41ed7bd658dba66823e26854a82914038a5f86f9f44118d01e1d3eb531701f9b175187b9e280b538770ad280af1348e5e1ab5ff37479efed36117c4cb7152d602b851bcb0516bb7f4cc45beb8440d5f49a56239163577e18ce6ea99681af', 
        }), 
      });
      const cordinates = await res.json();
      console.log(cordinates.data);
      if (cordinates.data.length == 0) {
        const highLat = Number(val) + 200;
        const lowLat = Number(val) - 200;
        const highLong = Number(val) + 200;
        const lowLong = Number(val) - 200;
        console.log(highLat, lowLat);
        console.log(highLong, lowLong);
        const query2 = qs.stringify({
          sort: ["Name:asc"],
          populate: "*",
          filters: {
            Lattitude: {
              $lt: highLat,
              $gt: lowLat
            },
            Longitude: {
              $lt: highLong,
              $gt: lowLong
            },
          },
          fields: ["Name", "Postcode", "State", "Lattitude", "Longitude"],
        });
        const res2 = await fetch(`https://dev-strapi-mable.itelalabs.net/api/providers?${query2}`, {
          method: `get`,
          headers: new Headers({
            'Authorization': 'Bearer 3d2991a1149d4d228d58d4ffaa96b8c2662142e01b6186f173d96ce96338534f460d41ed7bd658dba66823e26854a82914038a5f86f9f44118d01e1d3eb531701f9b175187b9e280b538770ad280af1348e5e1ab5ff37479efed36117c4cb7152d602b851bcb0516bb7f4cc45beb8440d5f49a56239163577e18ce6ea99681af', 
          }), 
        });
        const location = await res2.json();
        setLocation(location);
      } else {
        setLocation(cordinates);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {props.data.data && props.data.data.map((item, index) => (
        <div key={item.id}>
          <h1>{item.attributes.Title}</h1>
          <form>
            {item.attributes.Filter.map((filter, i) => (
              <div key={filter.id}>
                <input type="radio" name={item.attributes.Title} value={filter.Title} id={filter.id} 
                  onChange={(e) => {
                    setFlowSelection(filter.id);
                  }}
                />
                <h3><label htmlFor={i}>{filter.Title}</label></h3>
                <p>{filter.Description}</p><br/>
              </div>
            ))}
            {item.attributes.Filter.map((filter, i) => {
              console.log(flowSelection, filter.id);
              if (flowSelection == filter.id) {
                return (
                  <div key={i}>
                    <h2>{filter.search_flow.data.attributes.Title}</h2>
                    {filter.search_flow.data.attributes.SearchSection.map((flow, p) => (
                      <div>
                        <h3>{flow.Title}</h3>
                        {flow.Filters.map((flowFilters, q) => (
                          <div>
                            <input type="radio" name={flowFilters.Title} value={flowFilters.Title} id={flowFilters.id} />
                            <h3><label htmlFor={flowFilters.id}>{flowFilters.Title}</label></h3>
                            <p>{flowFilters.Description}</p><br/>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              }
            })}
          </form>
        </div>
      ))}
      <input type="text" placeholder="seach location" id="textboxid"
        onChange={(e) => {
          searchLocationbypostcode(e.target.value);
        }}
      />
      {location && location.data.map((item, index) => (
        <div key={item.id}>
          <h4>Title: {item.attributes.Name}</h4>
          <p>Postcode: {item.attributes.Postcode}</p>
          <p>State: {item.attributes.State}</p>
          <p>Lattitude: {item.attributes.Lattitude}</p>
          <p>Longitude: {item.attributes.Longitude}</p>
        </div>
      ))}
    </div>
  );
}

export async function getStaticProps() {
  console.log("hello");
  const res = await fetch(`http://localhost:1337/api/search-widgets?populate[0]=Filter&populate[1]=Filter.search_flow.SearchSection.Filters`);
  const data = await res.json();
  console.log(data);
  return {
    props: {
      data,
    },
  }
}