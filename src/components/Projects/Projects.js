import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import chatify from "../../Assets/Projects/chatify.png";


function Projects() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Works </strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={chatify}
              isBlog={false}
              title="Chatify"
              description="I am currently developing an overclocking and suite for laptops with both Intel and AMD CPUs for in order to make the unleash their full potential and also unlock the power of both the iGPU and dGPUs for the systems"
              ghLink="https://github.com/mfalme0/PerfSuite"
              demoLink="https://github.com/mfalme0/PerfSuite/releases/download/overclock/PerfSuite.7z"
            />
          </Col>

        
        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
