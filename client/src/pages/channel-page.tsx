import { useState,useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../channel/Editor";
import ChannelNav from "../channel/channel-nav";
import { ChannelPageProps } from "../type/interface";
import {socket} from "../channel/socket";
import {ConnectionState,Events,ConnectionManager} from "../components/editor/SocketUtils";


const ChannelPage: React.FC<ChannelPageProps>  = () => {
  const { channelId } = useParams();
  // const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [fooEvents, setFooEvents] = useState<string[]>([]);


  if (!channelId) {
    return <Navigate to={"/user/dashboard"} />;
  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value: string) {
      setFooEvents(previous => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
    };
  }, []);


  return (
    <>
      <ChannelNav />

      <div className="max-w-3xl min-h-[calc(100vh-4.5rem)] h-full mt-12 p-4 mx-auto">
      <ConnectionState isConnected={ isConnected } />
      <Events events={ fooEvents } />
      <ConnectionManager />

        <Editor  channelId={channelId} />
      </div>
    </>
  );
};

export default ChannelPage;
