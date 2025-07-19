import { useRouter } from 'next/router';

const ViewLeadButton = ({ lead }) => {
  const router = useRouter();

  const handleClick = () => {
    localStorage.setItem('selectedLead', JSON.stringify(lead));
    router.push({
      pathname: '/LeadDetails',
      query: { leadId: lead._id },
    });
  };

  return (
    <span
      onClick={handleClick}
      className="text-blue-600 hover:underline cursor-pointer"
    >
      View Lead
    </span>
  );
};

export default ViewLeadButton;
