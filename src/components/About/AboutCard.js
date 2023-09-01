import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi Everyone, I am <span className="purple">Joseph Gitau </span>
            from <span className="purple"> Kiambu, Kenya.</span>
            <br /> I am a final year student pursuing Computer Science (BSCS)
            at Umma University.
            <br />
            Additionally, I am currently learning game development
            <br />
            <br />
            Apart from coding, some other activities that I love to do!
          </p>
          <ul>
            <li className="about-activity">
              <ImPointRight /> Playing Games
            </li>
            <li className="about-activity">
              <ImPointRight /> Interior Design
            </li>
            <li className="about-activity">
              <ImPointRight /> Travelling
            </li>
          </ul>

          <p style={{ color: "rgb(66 66 66)" }}>
            "Always have fun creating!"{" "}
          </p>
          <footer className="blockquote-footer">Joseph</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
