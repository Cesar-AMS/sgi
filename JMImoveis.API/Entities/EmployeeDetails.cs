namespace JMImoveisAPI.Entities
{
    public class EmployeeDetails
    {
        public long Id { get; set; }
        public long UserId { get; set; }

        public string? Rg { get; set; }
        public DateTime? RgIssueDate { get; set; }
        public string? RgIssuer { get; set; }
        public string? RgState { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? BirthCity { get; set; }
        public string? BirthState { get; set; }
        public string? Nationality { get; set; }
        public string? MaritalStatus { get; set; }
        public string? SpouseName { get; set; }
        public string? FatherName { get; set; }
        public string? MotherName { get; set; }
        public string? EducationLevel { get; set; }
        public string? EducationStatus { get; set; }

        public string? CtpsNumber { get; set; }
        public string? CtpsSeries { get; set; }
        public string? CtpsState { get; set; }
        public DateTime? CtpsIssueDate { get; set; }
        public string? PisPasep { get; set; }
        public string? SusNumber { get; set; }
        public string? VoterTitle { get; set; }
        public string? VoterZone { get; set; }
        public string? VoterSection { get; set; }
        public string? ReservistNumber { get; set; }
        public string? ReservistCategory { get; set; }

        public bool? FirstJob { get; set; }
        public decimal? Salary { get; set; }
        public string? FunctionName { get; set; }
        public decimal? MonthlyWorkload { get; set; }
        public decimal? WeeklyWorkload { get; set; }
        public string? DayOff { get; set; }
        public int? ExperienceContractDays { get; set; }
        public int? ExperienceExtensionDays { get; set; }
        public decimal? TransportVoucherDiscount { get; set; }
        public string? WorkScheduleNotes { get; set; }

        public bool? HasDependents { get; set; }
        public string? DependentNotes { get; set; }
        public string? Notes { get; set; }

        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
