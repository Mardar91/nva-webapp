import React from "react";
import "./styles.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "../Pages/Home";
import Restaurants from "../Pages/Restaurants";
import Explore from "../Pages/Explore";
import BookNow from "../Pages/BookNow";
import CheckIn from "../Pages/CheckIn";
import Partners from "../Pages/Partners";
import Layout from "../components/Layout";

interface ExternalRedirectProps {
  to: string;
}

const ExternalRedirect: React.FC<ExternalRedirectProps> = ({ to }) => {
  React.useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
};

const IframeView: React.FC<{ src: string; title: string }> = ({
  src,
  title,
}) => {
  return <iframe src={src} className="w-full h-screen" title={title} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/book" element={<BookNow />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/partners" element={<Partners />} />
          <Route
            path="/taxi"
            element={
              <IframeView
                src="https://meet.brevo.com/nonnavittoria-transfer"
                title="Taxi Service"
              />
            }
          />
          <Route
            path="/shop"
            element={
              <IframeView
                src="https://store.nonnavittoriaapartments.it"
                title="Shop"
              />
            }
          />
          <Route
            path="/gift-card"
            element={
              <IframeView
                src="https://giftup.app/place-order/4bed8e87-1ecc-466c-4d3d-08db98c3a095"
                title="Gift Card"
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
