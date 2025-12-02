import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
const TicketDetailDialog = ({ selectedTicket, setSelectedTicket }) => {
  return (
    <Dialog
      open={!!selectedTicket}
      onClose={() => setSelectedTicket(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Ticket Details
        </Typography>
      </DialogTitle>
      <DialogContent>
        {selectedTicket && (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box>
                <img
                  src={selectedTicket.img}
                  alt={selectedTicket.title}
                  style={{
                    width: 180,
                    height: 120,
                    borderRadius: 18,
                    objectFit: "cover",
                    boxShadow: "0 4px 12px #eee",
                  }}
                />
              </Box>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={600}>
                  {selectedTicket.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTicket.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTicket.place}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  <strong>Ticket No:</strong> {selectedTicket.ticketNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>Seat:</strong> {selectedTicket.seat}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Order Date:</strong> {selectedTicket.orderDate}
                </Typography>
                <Box display="flex" gap={2} mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      alert("Download Ticket: " + selectedTicket.ticketNumber)
                    }
                  >
                    Download Ticket (PDF)
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setSelectedTicket(null)}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box mt={4} textAlign="center">
              <Typography variant="body2" sx={{ mb: 1 }}>
                Present this code at event entry
              </Typography>
              <img
                src={selectedTicket.qrCode}
                alt="Ticket QR Code"
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  boxShadow: "0px 4px 16px #eee",
                }}
              />
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailDialog;
