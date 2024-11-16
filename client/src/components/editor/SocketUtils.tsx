import {socket} from "../../channel/socket"
export function ConnectionState({ isConnected }: { isConnected: boolean }) {
  return <p>State: { '' + isConnected }</p>;
}

export function Events({ events }: { events: string[] }) {
  return (
    <ul>
    {
      events.map((event:string, index:number) =>
        <li key={ index }>{ event }</li>
      )
    }
    </ul>
  );
}



export function ConnectionManager() {
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <>
      <button onClick={ connect }>Connect</button>
      <button onClick={ disconnect }>Disconnect</button>
    </>
  );
}